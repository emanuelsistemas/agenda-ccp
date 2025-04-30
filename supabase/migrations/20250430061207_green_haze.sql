/*
  # Add schedules and assignments tables

  1. New Tables
    - `schedules`
      - `id` (uuid, primary key)
      - `admin_id` (uuid, foreign key to profiles)
      - `date` (date)
      - `title` (text)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `schedule_assignments`
      - `id` (uuid, primary key)
      - `schedule_id` (uuid, foreign key to schedules)
      - `user_id` (uuid, foreign key to profiles_user)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their schedules
*/

-- Create schedules table
CREATE TABLE schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT schedules_date_admin_unique UNIQUE (date, admin_id)
);

-- Create schedule assignments table
CREATE TABLE schedule_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid REFERENCES schedules(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles_user(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT schedule_assignments_unique UNIQUE (schedule_id, user_id)
);

-- Enable RLS
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for schedules
CREATE POLICY "Users can create their own schedules"
ON schedules FOR INSERT TO authenticated
WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Users can view their own schedules"
ON schedules FOR SELECT TO authenticated
USING (auth.uid() = admin_id);

CREATE POLICY "Users can update their own schedules"
ON schedules FOR UPDATE TO authenticated
USING (auth.uid() = admin_id)
WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Users can delete their own schedules"
ON schedules FOR DELETE TO authenticated
USING (auth.uid() = admin_id);

-- Policies for schedule assignments
CREATE POLICY "Users can manage their schedule assignments"
ON schedule_assignments FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM schedules
    WHERE schedules.id = schedule_assignments.schedule_id
    AND schedules.admin_id = auth.uid()
  )
);