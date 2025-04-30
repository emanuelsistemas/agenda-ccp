/*
  # Enable RLS and create policies for profiles_user table

  1. Security Changes
    - Enable Row Level Security on profiles_user table
    - Add policies for authenticated users to:
      - Create new users (when admin_id matches their user ID)
      - Read their own users
      - Update their own users
      - Delete their own users
    
  2. Notes
    - All policies use auth.uid() to verify user identity
    - Policies ensure admins can only manage their own users
*/

-- Enable RLS
ALTER TABLE profiles_user ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can create users"
ON profiles_user
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can read their users"
ON profiles_user
FOR SELECT
TO authenticated
USING (auth.uid() = admin_id);

CREATE POLICY "Admins can update their users"
ON profiles_user
FOR UPDATE
TO authenticated
USING (auth.uid() = admin_id)
WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can delete their users"
ON profiles_user
FOR DELETE
TO authenticated
USING (auth.uid() = admin_id);