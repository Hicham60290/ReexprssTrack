-- Migration: Add tracking_17track_enabled field to packages table
-- Date: 2025-10-31
-- Description: Add a boolean field to track if admin has enabled 17Track tracking for a package

-- Add the new column
ALTER TABLE packages
ADD COLUMN tracking_17track_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN packages.tracking_17track_enabled IS 'Indicates if admin has enabled 17Track tracking for this package';

-- Create index for faster queries
CREATE INDEX idx_packages_17track_enabled ON packages(tracking_17track_enabled);
