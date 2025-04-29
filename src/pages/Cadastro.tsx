import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Building2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-toastify';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const TIPOS_MINISTERIO = [
  'Brigadistas',
  'Louvor',
  'Infantil',
  'Jovens',
  'Recepção',
  'Som e Mídia',
  'Outros'
];

const Cadastro: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    nomeMinisterio: '',
    tipoMinisterio: '',
    descricao: '',
    nomeAdmin: '',
    email: '',
    senha: '',
    confirmacaoSenha: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validatePasswords = () => {
    if (formData.senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (formData.senha !== formData.confirmacaoSenha) {
      toast.error('As senhas não coincidem');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!validatePasswords()) {
        setLoading(false);
        return;
      }

      // Check if user already exists in profiles table
      const { data: existingProfiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email)
        .single();

      if (existingProfiles) {
        toast.error('Este email já está cadastrado. Por favor, faça login ou use outro email.');
        setLoading(false);
        return;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha
      });

      if (authError) {
        if (authError.message === 'User already registered') {
          toast.error('Este email já está cadastrado. Por favor, faça login ou use outro email.');
        } else {
          toast.error(`Erro no cadastro: ${authError.message}`);
        }
        return;
      }

      if (!authData.user) {
        toast.error('Erro ao criar usuário');
        return;
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            nome_ministerio: formData.nomeMinisterio,
            tipo_ministerio: formData.tipoMinisterio,
            descricao: formData.descricao,
            nome_admin: formData.nomeAdmin,
            email: formData.email
          }
        ]);

      if (profileError) {
        toast.error(`Erro ao criar perfil: ${profileError.message}`);
        return;
      }

      setSuccess(true);
      toast.success('Cadastro realizado com sucesso!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      toast.error('Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
        <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-900/30">
            <Calendar className="h-8 w-8 text-green-400" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">Cadastro Realizado!</h2>
          <p className="text-gray-400">
            Seu ministério foi cadastrado com sucesso. Você será redirecionado para a página de login.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-md">
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-3xl font-bold text-white">Cadastrar Ministério</h2>
          <p className="text-gray-400">
            Crie sua agenda personalizada para seu ministério
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              <div className="flex items-center">
                <Building2 className="mr-2 h-4 w-4 text-yellow-500" />
                Nome do Ministério
              </div>
            </label>
            <input
              type="text"
              name="nomeMinisterio"
              value={formData.nomeMinisterio}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-700 bg-gray-700 p-3 text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
              placeholder="Ex: Ministério Shekina"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Tipo do Ministério
            </label>
            <select
              name="tipoMinisterio"
              value={formData.tipoMinisterio}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-700 bg-gray-700 p-3 text-white focus:border-yellow-500 focus:outline-none"
              required
            >
              <option value="">Selecione um tipo</option>
              {TIPOS_MINISTERIO.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Descrição (opcional)
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-700 bg-gray-700 p-3 text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
              placeholder="Descreva brevemente seu ministério"
              rows={3}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4 text-yellow-500" />
                Nome do Administrador
              </div>
            </label>
            <input
              type="text"
              name="nomeAdmin"
              value={formData.nomeAdmin}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-700 bg-gray-700 p-3 text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-yellow-500" />
                Email
              </div>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-700 bg-gray-700 p-3 text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              <div className="flex items-center">
                <Lock className="mr-2 h-4 w-4 text-yellow-500" />
                Senha
              </div>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-700 bg-gray-700 p-3 text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
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

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Confirmar Senha
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmacaoSenha"
                value={formData.confirmacaoSenha}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-700 bg-gray-700 p-3 text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-yellow-600 px-5 py-3 text-center font-medium text-white transition-colors hover:bg-yellow-700 focus:outline-none disabled:opacity-50"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar Ministério'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Já tem uma conta?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-yellow-500 hover:text-yellow-400"
          >
            Faça login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Cadastro;