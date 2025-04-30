/*
  # Add user type field to profiles table

  1. Changes
    - Add `tipo_user` column to profiles table with default value 'S'
      - 'S' for standard user
      - 'A' for admin user

  2. Security
    - No changes to RLS policies needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'tipo_user'
  ) THEN
    ALTER TABLE profiles ADD COLUMN tipo_user text NOT NULL DEFAULT 'S';
  END IF;
END $$;