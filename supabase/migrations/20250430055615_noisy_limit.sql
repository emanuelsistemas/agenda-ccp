/*
  # Update RLS policies for profiles_user table
  
  1. Changes
    - Temporarily disable RLS
    - Drop existing policies
    - Re-enable RLS
    - Recreate policies with correct permissions
  
  2. Security
    - Maintains same security model
    - Ensures admins can only access their own users
*/

-- Temporarily disable RLS
ALTER TABLE profiles_user DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can create users" ON profiles_user;
DROP POLICY IF EXISTS "Admins can read their users" ON profiles_user;
DROP POLICY IF EXISTS "Admins can update their users" ON profiles_user;
DROP POLICY IF EXISTS "Admins can delete their users" ON profiles_user;

-- Re-enable RLS
ALTER TABLE profiles_user ENABLE ROW LEVEL SECURITY;

-- Recreate policies
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