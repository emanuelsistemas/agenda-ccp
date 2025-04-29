import React, { useState } from 'react';
import CadastroUsuario from '../../components/admin/CadastroUsuario';
import { User, Users, Plus, Search, Trash2 } from 'lucide-react';

// Este componente é um mock para demonstração
// Em uma implementação real, seria conectado a um contexto de usuários
const AdminUsuarios: React.FC = () => {
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [pesquisa, setPesquisa] = useState('');

  // Mock de usuários
  const usuariosMock = [
    { id: '1', nome: 'Administrador', email: 'admin@agendaccp.com', isAdmin: true },
    { id: '2', nome: 'João Coordenador', email: 'joao@agendaccp.com', isAdmin: false },
  ];

  // Filtra usuários conforme texto de pesquisa
  const usuariosFiltrados = usuariosMock.filter(u => 
    u.nome.toLowerCase().includes(pesquisa.toLowerCase()) || 
    u.email.toLowerCase().includes(pesquisa.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Users className="mr-3 h-6 w-6 text-yellow-500" />
          <h1 className="text-2xl font-bold text-white">Gerenciar Usuários</h1>
        </div>

        <button
          onClick={() => setMostrarCadastro(true)}
          className="flex items-center rounded-md bg-yellow-600 px-4 py-2 font-medium text-white transition-colors hover:bg-yellow-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </button>
      </div>

      <div className="mb-6 rounded-lg bg-gray-800/70 p-4 shadow-md">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full rounded-md border-0 bg-gray-700 py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Buscar por nome ou email..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg bg-gray-800/70 p-4 shadow-md">
        <div className="overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-300">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 bg-gray-800">
              {usuariosFiltrados.length > 0 ? (
                usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} className="transition-colors hover:bg-gray-700">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">
                      {usuario.nome}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                      {usuario.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        usuario.isAdmin 
                          ? 'bg-yellow-900/30 text-yellow-400' 
                          : 'bg-blue-900/30 text-blue-400'
                      }`}>
                        {usuario.isAdmin ? 'Administrador' : 'Usuário'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      {usuario.id !== '1' && (
                        <button
                          className="rounded p-1 text-gray-400 transition-colors hover:bg-red-900/30 hover:text-red-400"
                          aria-label="Excluir"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">
                    {pesquisa ? 'Nenhum usuário encontrado com esta pesquisa.' : 'Nenhum usuário cadastrado.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mostrarCadastro && (
        <CadastroUsuario onClose={() => setMostrarCadastro(false)} />
      )}
    </div>
  );
};

export default AdminUsuarios;