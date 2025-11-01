/**
 * 17Track API Integration Service
 * Documentation: https://api.17track.net/en/doc
 */

import axios, { AxiosInstance } from 'axios'
import { FastifyBaseLogger } from 'fastify'

const API_BASE_URL = 'https://api.17track.net/track/v2.2'

export interface TrackingNumber {
  number: string
  carrier?: number // Carrier code (optional, auto-detect if not provided)
  tag?: string // Custom tag for identification
}

export interface TrackingEvent {
  time: string
  location?: string
  description: string
  status?: string
}

export interface TrackingInfo {
  number: string
  carrier: number
  carrierName?: string
  status: string
  statusDescription: string
  events: TrackingEvent[]
  destinationCountry?: string
  originCountry?: string
  deliveryTime?: string
  weight?: string
  packageType?: string
}

export interface RegisterTrackingInput {
  trackingNumbers: TrackingNumber[]
}

export interface GetTrackingInput {
  trackingNumbers: string[]
}

export class TrackingService {
  private client: AxiosInstance
  private apiKey: string
  private logger: FastifyBaseLogger

  constructor(apiKey: string, logger: FastifyBaseLogger) {
    this.apiKey = apiKey
    this.logger = logger

    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        '17token': apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })
  }

  /**
   * Register tracking numbers to start monitoring
   */
  async registerTracking(input: RegisterTrackingInput): Promise<any> {
    try {
      const response = await this.client.post('/register', input.trackingNumbers)
      this.logger.info({ trackingNumbers: input.trackingNumbers.length }, 'Registered tracking numbers')
      return response.data
    } catch (error: any) {
      this.logger.error({ error: error.message }, 'Failed to register tracking numbers')
      throw new Error(`17Track registration failed: ${error.message}`)
    }
  }

  /**
   * Get tracking information for registered numbers
   */
  async getTrackingInfo(input: GetTrackingInput): Promise<TrackingInfo[]> {
    try {
      const response = await this.client.post('/gettrackinfo', input.trackingNumbers)

      if (response.data.code !== 0) {
        throw new Error(`17Track API error: ${response.data.msg}`)
      }

      const trackingInfos: TrackingInfo[] = response.data.data.accepted.map((item: any) => ({
        number: item.number,
        carrier: item.track.w1,
        carrierName: item.track.w2,
        status: this.mapStatus(item.track.e),
        statusDescription: this.getStatusDescription(item.track.e),
        events: this.mapEvents(item.track.z0 || []),
        destinationCountry: item.track.b,
        originCountry: item.track.c,
        deliveryTime: item.track.z1?.a,
        weight: item.track.w0,
        packageType: item.track.w3,
      }))

      this.logger.info({ count: trackingInfos.length }, 'Retrieved tracking information')
      return trackingInfos
    } catch (error: any) {
      this.logger.error({ error: error.message }, 'Failed to get tracking info')
      throw new Error(`17Track query failed: ${error.message}`)
    }
  }

  /**
   * Auto-detect carrier for a tracking number
   */
  async detectCarrier(trackingNumber: string): Promise<number[]> {
    try {
      const response = await this.client.post('/carrier/detect', {
        tracking_number: trackingNumber,
      })

      if (response.data.code !== 0) {
        throw new Error(`Carrier detection failed: ${response.data.msg}`)
      }

      return response.data.data.carriers || []
    } catch (error: any) {
      this.logger.error({ error: error.message, trackingNumber }, 'Failed to detect carrier')
      throw new Error(`Carrier detection failed: ${error.message}`)
    }
  }

  /**
   * Delete tracking number from monitoring
   */
  async deleteTracking(trackingNumbers: string[]): Promise<any> {
    try {
      const response = await this.client.post('/deletetrack', trackingNumbers)
      this.logger.info({ count: trackingNumbers.length }, 'Deleted tracking numbers')
      return response.data
    } catch (error: any) {
      this.logger.error({ error: error.message }, 'Failed to delete tracking numbers')
      throw new Error(`17Track deletion failed: ${error.message}`)
    }
  }

  /**
   * Map 17track status code to readable status
   */
  private mapStatus(statusCode: number): string {
    const statusMap: Record<number, string> = {
      0: 'NOT_FOUND',
      10: 'IN_TRANSIT',
      20: 'EXPIRED',
      30: 'PICKUP',
      35: 'UNDELIVERED',
      40: 'DELIVERED',
      50: 'ALERT',
    }
    return statusMap[statusCode] || 'UNKNOWN'
  }

  /**
   * Get status description in French
   */
  private getStatusDescription(statusCode: number): string {
    const descriptions: Record<number, string> = {
      0: 'Non trouvé',
      10: 'En transit',
      20: 'Expiré',
      30: 'Prêt pour enlèvement',
      35: 'Non livré',
      40: 'Livré',
      50: 'Alerte/Exception',
    }
    return descriptions[statusCode] || 'Statut inconnu'
  }

  /**
   * Map tracking events
   */
  private mapEvents(events: any[]): TrackingEvent[] {
    return events.map((event) => ({
      time: event.a,
      location: event.c,
      description: event.z,
      status: event.d,
    }))
  }

  /**
   * Get carrier name by code
   */
  async getCarrierName(carrierCode: number): Promise<string> {
    // Common carrier codes
    const carriers: Record<number, string> = {
      10001: 'La Poste',
      10002: 'Colissimo',
      10003: 'Chronopost',
      10004: 'DHL',
      10005: 'FedEx',
      10006: 'UPS',
      10007: 'TNT',
      10008: 'DPD',
      10009: 'GLS',
      // Add more as needed
    }
    return carriers[carrierCode] || `Carrier ${carrierCode}`
  }
}

export default TrackingService
