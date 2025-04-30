/*
  # Update profiles_user table CPF constraint

  1. Changes
    - Remove unique constraint from CPF column in profiles_user table
    - Add composite unique constraint for CPF and admin_id to ensure a user can't be registered twice under the same ministry
    
  2. Security
    - Maintains existing RLS policies
    - Ensures data integrity within each ministry
*/

-- Drop the existing unique constraint on CPF
ALTER TABLE profiles_user DROP CONSTRAINT IF EXISTS profiles_user_cpf_key;

-- Create a new composite unique constraint
ALTER TABLE profiles_user 
ADD CONSTRAINT profiles_user_cpf_admin_unique 
UNIQUE (cpf, admin_id);