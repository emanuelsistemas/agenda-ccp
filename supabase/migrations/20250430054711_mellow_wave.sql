/*
  # Create profiles_user table

  1. New Tables
    - `profiles_user`
      - `id` (uuid, primary key)
      - `nome_usuario` (text, not null)
      - `cpf` (text, not null, unique)
      - `admin_id` (uuid, foreign key to profiles.id)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `profiles_user` table
    - Add policies for authenticated users to manage their users
*/

CREATE TABLE IF NOT EXISTS profiles_user (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_usuario text NOT NULL,
  cpf text NOT NULL UNIQUE,
  admin_id uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles_user ENABLE ROW LEVEL SECURITY;

-- Allow admins to read their users
CREATE POLICY "Admins can read their users"
  ON profiles_user
  FOR SELECT
  TO authenticated
  USING (auth.uid() = admin_id);

-- Allow admins to insert their users
CREATE POLICY "Admins can create users"
  ON profiles_user
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = admin_id);

-- Allow admins to update their users
CREATE POLICY "Admins can update their users"
  ON profiles_user
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = admin_id)
  WITH CHECK (auth.uid() = admin_id);

-- Allow admins to delete their users
CREATE POLICY "Admins can delete their users"
  ON profiles_user
  FOR DELETE
  TO authenticated
  USING (auth.uid() = admin_id);