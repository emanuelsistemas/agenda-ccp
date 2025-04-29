/*
  # Disable RLS on profiles table

  This migration disables row level security on the profiles table
  to allow unrestricted access during development.

  WARNING: This should be re-enabled with proper policies before production deployment.
*/

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;