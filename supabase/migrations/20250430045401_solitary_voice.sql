/*
  # Desabilitar RLS da tabela profiles

  1. Alterações
    - Desabilita Row Level Security na tabela profiles
    - Remove todas as políticas existentes
*/

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can create profiles during signup" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;