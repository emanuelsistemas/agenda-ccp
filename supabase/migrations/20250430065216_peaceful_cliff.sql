/*
  # Check and update RLS for schedules table
  
  1. Security
    - Ensure RLS is enabled on schedules table
    - Drop existing policies if they exist
    - Recreate policies with proper permissions
*/

-- Enable RLS if not already enabled
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can view their own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can update their own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can delete their own schedules" ON schedules;

-- Create policies
CREATE POLICY "Users can create their own schedules"
  ON schedules
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Users can view their own schedules"
  ON schedules
  FOR SELECT
  TO authenticated
  USING (auth.uid() = admin_id);

CREATE POLICY "Users can update their own schedules"
  ON schedules
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = admin_id)
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Users can delete their own schedules"
  ON schedules
  FOR DELETE
  TO authenticated
  USING (auth.uid() = admin_id);