import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        toast.error('Email ou senha inválidos');
        return;
      }

      if (data.user) {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          toast.error('Erro ao carregar perfil do usuário');
          return;
        }

        const success = await login(email, senha);
        if (success) {
          toast.success('Login realizado com sucesso!');
          navigate('/admin/calendario');
        }
      }
    } catch (error) {
      toast.error('Erro ao fazer login');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-md">
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-3xl font-bold text-white">Agenda CCP</h2>
          <p className="text-gray-400">Faça login para acessar a área administrativa</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-700 p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="senha" className="mb-2 block text-sm font-medium text-gray-300">
              Senha
            </label>
            <div className="relative">
              <input
                id="senha"
                type={showPassword ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-700 p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-yellow-600 px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-yellow-700 focus:outline-none disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Não tem uma conta ainda?{' '}
            <Link to="/cadastro" className="text-yellow-500 hover:text-yellow-400">
              Cadastre seu ministério
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;