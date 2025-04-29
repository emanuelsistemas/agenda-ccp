import React, { useState } from 'react';
import { User, X } from 'lucide-react';

interface CadastroUsuarioProps {
  onClose: () => void;
}

// Este componente é um mock para demonstração
// Em uma implementação real, seria conectado a um contexto de usuários
const CadastroUsuario: React.FC<CadastroUsuarioProps> = ({ onClose }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nome || !email || !senha) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (senha !== confirmacaoSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    // Simulação de cadastro
    setTimeout(() => {
      setSuccess(true);
      // Em uma aplicação real, aqui seria feita a conexão com a API
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-lg bg-gray-800 shadow-xl">
        <div className="flex items-center justify-between rounded-t-lg bg-gray-700 p-4">
          <h2 className="text-xl font-bold text-white">Cadastrar Novo Usuário</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-600 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {success ? (
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-900/30">
              <User className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">Usuário Cadastrado</h3>
            <p className="mb-6 text-gray-400">
              O novo usuário foi cadastrado com sucesso e já pode acessar o sistema.
            </p>
            <button
              onClick={onClose}
              className="mx-auto rounded-md bg-yellow-600 px-4 py-2 font-medium text-white transition-colors hover:bg-yellow-700"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4">
            {error && (
              <div className="mb-4 rounded bg-red-900/50 p-3 text-white">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="nome" className="mb-1 block text-sm font-medium text-gray-300">
                Nome
              </label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-md border border-gray-700 bg-gray-700 p-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                placeholder="Nome do usuário"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-700 bg-gray-700 p-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                placeholder="email@exemplo.com"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="senha" className="mb-1 block text-sm font-medium text-gray-300">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-md border border-gray-700 bg-gray-700 p-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="confirmacao-senha" className="mb-1 block text-sm font-medium text-gray-300">
                Confirmar Senha
              </label>
              <input
                id="confirmacao-senha"
                type="password"
                value={confirmacaoSenha}
                onChange={(e) => setConfirmacaoSenha(e.target.value)}
                className="w-full rounded-md border border-gray-700 bg-gray-700 p-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center">
                <input
                  id="isAdmin"
                  type="checkbox"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-yellow-600 focus:ring-2 focus:ring-yellow-500"
                />
                <label htmlFor="isAdmin" className="ml-2 text-sm text-gray-300">
                  Administrador
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Administradores podem gerenciar cultos, brigadistas e outros usuários.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-700"
              >
                Cadastrar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CadastroUsuario;