/*
  # Enable RLS for schedules table

  1. Security Changes
    - Enable RLS on schedules table
    - Add policies for CRUD operations
    - Ensure only authenticated users can manage their own schedules
*/

-- Enable RLS
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

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