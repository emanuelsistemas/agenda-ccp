/*
  # Add period to schedules table

  1. Changes
    - Add period column to schedules table for morning/evening services
    - Update unique constraint to handle periods
    - Add validation for period values
  
  2. Security
    - Maintains existing RLS policies
*/

-- Drop existing unique constraint
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_date_admin_unique;

-- Add period column if it doesn't exist
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS period text;

-- Add check constraint for period values
ALTER TABLE schedules ADD CONSTRAINT schedules_period_check 
  CHECK (period IN ('morning', 'evening') OR period IS NULL);

-- Create new unique constraint including period
CREATE UNIQUE INDEX schedules_date_admin_period_unique 
  ON schedules (date, admin_id, period);

-- Add index for period column
CREATE INDEX IF NOT EXISTS schedules_period_idx ON schedules (period);