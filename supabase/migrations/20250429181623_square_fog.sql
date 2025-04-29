/*
  # Add insert policy for profiles table
  
  1. Changes
    - Add RLS policy to allow users to insert their own profile during registration
  
  2. Security
    - Policy ensures users can only insert a profile with their own auth.uid()
    - Maintains existing policies for SELECT and UPDATE
*/

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);