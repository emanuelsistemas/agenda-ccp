/*
  # Add email field to profiles table

  1. Changes
    - Add email column to profiles table
    - Make email unique to prevent duplicate registrations
    - Add index on email for faster lookups

  2. Security
    - No RLS changes needed as table is already configured
*/

ALTER TABLE profiles
ADD COLUMN email text NOT NULL;

-- Add unique constraint to prevent duplicate emails
ALTER TABLE profiles
ADD CONSTRAINT profiles_email_key UNIQUE (email);

-- Add index for faster email lookups
CREATE INDEX profiles_email_idx ON profiles (email);