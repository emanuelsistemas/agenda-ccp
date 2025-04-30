/*
  # Add status field to profiles_user table

  1. Changes
    - Add `status` column to `profiles_user` table with default value 'active'
    - Add check constraint to ensure status is either 'active' or 'inactive'
*/

ALTER TABLE profiles_user 
ADD COLUMN status text NOT NULL DEFAULT 'active'
CHECK (status IN ('active', 'inactive'));