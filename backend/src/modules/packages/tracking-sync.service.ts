/**
 * Tracking Synchronization Service
 * Syncs package tracking data with 17Track API
 */

import { FastifyBaseLogger } from 'fastify'
import { PrismaClient } from '@prisma/client'
import TrackingService from '../tracking/tracking.service'

const prisma = new PrismaClient()

export class TrackingSyncService {
  private trackingService: TrackingService
  private logger: FastifyBaseLogger

  constructor(trackingService: TrackingService, logger: FastifyBaseLogger) {
    this.trackingService = trackingService
    this.logger = logger
  }

  /**
   * Register package tracking with 17Track
   */
  async registerPackageTracking(packageId: string): Promise<void> {
    try {
      const pkg = await prisma.package.findUnique({
        where: { id: packageId },
      })

      if (!pkg || !pkg.trackingNumber) {
        throw new Error('Package not found or missing tracking number')
      }

      // Register with 17Track
      await this.trackingService.registerTracking({
        trackingNumbers: [
          {
            number: pkg.trackingNumber,
            carrier: pkg.carrier || undefined,
            tag: packageId,
          },
        ],
      })

      this.logger.info({ packageId, trackingNumber: pkg.trackingNumber }, 'Registered package tracking')
    } catch (error: any) {
      this.logger.error({ error: error.message, packageId }, 'Failed to register package tracking')
      throw error
    }
  }

  /**
   * Sync tracking events from 17Track to database
   */
  async syncTrackingEvents(packageId: string): Promise<void> {
    try {
      const pkg = await prisma.package.findUnique({
        where: { id: packageId },
      })

      if (!pkg || !pkg.trackingNumber) {
        throw new Error('Package not found or missing tracking number')
      }

      // Get tracking info from 17Track
      const trackingInfos = await this.trackingService.getTrackingInfo({
        trackingNumbers: [pkg.trackingNumber],
      })

      if (trackingInfos.length === 0) {
        this.logger.warn({ packageId, trackingNumber: pkg.trackingNumber }, 'No tracking info found')
        return
      }

      const trackingInfo = trackingInfos[0]

      // Update package carrier if not set
      if (!pkg.carrier && trackingInfo.carrier) {
        await prisma.package.update({
          where: { id: packageId },
          data: {
            carrier: trackingInfo.carrier,
            carrierName: trackingInfo.carrierName,
          },
        })
      }

      // Update package status based on tracking status
      await this.updatePackageStatus(packageId, trackingInfo.status)

      // Sync tracking events
      for (const event of trackingInfo.events) {
        // Check if event already exists
        const existingEvent = await prisma.trackingEvent.findFirst({
          where: {
            packageId,
            timestamp: new Date(event.time),
            description: event.description,
          },
        })

        if (!existingEvent) {
          await prisma.trackingEvent.create({
            data: {
              packageId,
              eventType: event.status || 'UPDATE',
              description: event.description,
              location: event.location,
              timestamp: new Date(event.time),
              rawData: event,
            },
          })
        }
      }

      this.logger.info(
        { packageId, eventCount: trackingInfo.events.length },
        'Synced tracking events'
      )
    } catch (error: any) {
      this.logger.error({ error: error.message, packageId }, 'Failed to sync tracking events')
      throw error
    }
  }

  /**
   * Update package status based on tracking status
   */
  private async updatePackageStatus(packageId: string, trackingStatus: string): Promise<void> {
    const statusMap: Record<string, string> = {
      IN_TRANSIT: 'IN_TRANSIT',
      DELIVERED: 'DELIVERED',
      PICKUP: 'RECEIVED',
      UNDELIVERED: 'RETURNED',
      ALERT: 'STORED', // Keep as is, manual intervention needed
    }

    const newStatus = statusMap[trackingStatus]
    if (newStatus) {
      await prisma.package.update({
        where: { id: packageId },
        data: { status: newStatus as any },
      })

      this.logger.info(
        { packageId, trackingStatus, newStatus },
        'Updated package status from tracking'
      )
    }
  }

  /**
   * Sync all active package trackings
   */
  async syncAllActivePackages(): Promise<void> {
    try {
      const activePackages = await prisma.package.findMany({
        where: {
          trackingNumber: { not: null },
          status: {
            notIn: ['DELIVERED', 'CANCELLED', 'RETURNED'],
          },
        },
      })

      this.logger.info({ count: activePackages.length }, 'Syncing active packages')

      for (const pkg of activePackages) {
        try {
          await this.syncTrackingEvents(pkg.id)
        } catch (error: any) {
          this.logger.error(
            { error: error.message, packageId: pkg.id },
            'Failed to sync package, continuing with next'
          )
        }
      }

      this.logger.info('Completed syncing all active packages')
    } catch (error: any) {
      this.logger.error({ error: error.message }, 'Failed to sync active packages')
      throw error
    }
  }

  /**
   * Auto-detect carrier for package
   */
  async detectAndSetCarrier(packageId: string): Promise<void> {
    try {
      const pkg = await prisma.package.findUnique({
        where: { id: packageId },
      })

      if (!pkg || !pkg.trackingNumber) {
        throw new Error('Package not found or missing tracking number')
      }

      if (pkg.carrier) {
        this.logger.info({ packageId }, 'Carrier already set, skipping detection')
        return
      }

      // Detect carrier
      const carriers = await this.trackingService.detectCarrier(pkg.trackingNumber)

      if (carriers.length > 0) {
        const carrierCode = carriers[0]
        const carrierName = await this.trackingService.getCarrierName(carrierCode)

        await prisma.package.update({
          where: { id: packageId },
          data: {
            carrier: carrierCode,
            carrierName,
          },
        })

        this.logger.info(
          { packageId, carrier: carrierCode, carrierName },
          'Auto-detected and set carrier'
        )
      }
    } catch (error: any) {
      this.logger.error({ error: error.message, packageId }, 'Failed to detect carrier')
      throw error
    }
  }
}

export default TrackingSyncService
