-- Migration: Add email_preferences table
-- Date: 2025-11-01
-- Description: Add email notification preferences for users

-- Create email_preferences table
CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,

  -- Package notifications
  package_received BOOLEAN NOT NULL DEFAULT TRUE,
  package_shipped BOOLEAN NOT NULL DEFAULT TRUE,
  package_delivered BOOLEAN NOT NULL DEFAULT TRUE,

  -- Quote notifications
  quote_created BOOLEAN NOT NULL DEFAULT TRUE,
  quote_updated BOOLEAN NOT NULL DEFAULT TRUE,

  -- Payment notifications
  payment_received BOOLEAN NOT NULL DEFAULT TRUE,
  payment_failed BOOLEAN NOT NULL DEFAULT TRUE,

  -- Account and marketing
  account_updates BOOLEAN NOT NULL DEFAULT TRUE,
  promotional_emails BOOLEAN NOT NULL DEFAULT FALSE,
  weekly_digest BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id);

-- Add comment
COMMENT ON TABLE email_preferences IS 'Stores user email notification preferences';
COMMENT ON COLUMN email_preferences.package_received IS 'Send email when package received at warehouse';
COMMENT ON COLUMN email_preferences.package_shipped IS 'Send email when package is shipped';
COMMENT ON COLUMN email_preferences.package_delivered IS 'Send email when package is delivered';
COMMENT ON COLUMN email_preferences.quote_created IS 'Send email when quote is created';
COMMENT ON COLUMN email_preferences.quote_updated IS 'Send email when quote is updated';
COMMENT ON COLUMN email_preferences.payment_received IS 'Send email when payment is received';
COMMENT ON COLUMN email_preferences.payment_failed IS 'Send email when payment fails';
COMMENT ON COLUMN email_preferences.account_updates IS 'Send email for account security updates';
COMMENT ON COLUMN email_preferences.promotional_emails IS 'Send promotional and marketing emails';
COMMENT ON COLUMN email_preferences.weekly_digest IS 'Send weekly activity digest';
