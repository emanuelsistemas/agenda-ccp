/*
  # Enable RLS for profiles_user table

  1. Security Changes
    - Enable RLS on profiles_user table
    - Add policies for CRUD operations:
      - Admins can create users (INSERT)
      - Admins can read their users (SELECT)
      - Admins can update their users (UPDATE)
      - Admins can delete their users (DELETE)

  2. Notes
    - All operations are restricted to authenticated users
    - Users can only be managed by their admin (admin_id match)
*/

-- Enable RLS
ALTER TABLE profiles_user ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can create users"
ON profiles_user
FOR INSERT
TO authenticated
WITH CHECK (uid() = admin_id);

CREATE POLICY "Admins can read their users"
ON profiles_user
FOR SELECT
TO authenticated
USING (uid() = admin_id);

CREATE POLICY "Admins can update their users"
ON profiles_user
FOR UPDATE
TO authenticated
USING (uid() = admin_id)
WITH CHECK (uid() = admin_id);

CREATE POLICY "Admins can delete their users"
ON profiles_user
FOR DELETE
TO authenticated
USING (uid() = admin_id);