/*
  # Add announcements table

  1. New Tables
    - `announcements`
      - `id` (uuid, primary key)
      - `admin_id` (uuid, foreign key to profiles)
      - `title` (text)
      - `content` (text)
      - `created_at` (timestamp with time zone)
      - `active` (boolean)

  2. Security
    - Enable RLS on `announcements` table
    - Add policies for authenticated users to manage their announcements
*/

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  active boolean DEFAULT true,
  CONSTRAINT announcements_title_length CHECK (char_length(title) <= 100)
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own announcements"
  ON announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Users can view their own announcements"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = admin_id);

CREATE POLICY "Users can update their own announcements"
  ON announcements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = admin_id)
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Users can delete their own announcements"
  ON announcements
  FOR DELETE
  TO authenticated
  USING (auth.uid() = admin_id);

-- Create index for admin_id
CREATE INDEX announcements_admin_id_idx ON announcements(admin_id);