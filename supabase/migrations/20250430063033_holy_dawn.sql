/*
  # Add period to schedules table

  1. Changes
    - Add `period` column to `schedules` table to distinguish between morning and evening services
    - Add check constraint to ensure period is either 'morning', 'evening', or null
    - Update unique constraint to include period in the uniqueness check
    - Add index on period column for better query performance

  2. Notes
    - Period can be null for regular weekday services
    - Only Sunday services will have period values
*/

-- Drop existing unique constraint
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_date_admin_unique;

-- Add period column
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS period text;

-- Add check constraint for period values
ALTER TABLE schedules ADD CONSTRAINT schedules_period_check 
  CHECK (period IN ('morning', 'evening') OR period IS NULL);

-- Create new unique constraint including period
ALTER TABLE schedules ADD CONSTRAINT schedules_date_admin_period_unique 
  UNIQUE (date, admin_id, COALESCE(period, 'none'));

-- Add index for period column
CREATE INDEX IF NOT EXISTS schedules_period_idx ON schedules (period);