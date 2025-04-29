/*
  # Fix RLS policies and enable RLS

  1. Changes
    - Re-enable RLS on profiles table
    - Update policies to properly handle authentication
    - Add policy for public access to profiles during signup

  2. Security
    - Ensures proper access control while allowing necessary operations
*/

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new policies
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow public access for profile creation during signup
CREATE POLICY "Public can create profiles during signup"
ON profiles FOR INSERT
TO public
WITH CHECK (true);