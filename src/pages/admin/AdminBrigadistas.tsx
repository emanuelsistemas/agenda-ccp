import React, { useState } from 'react';
import { useAgenda } from '../../context/AgendaContext';
import CadastroBrigadista from '../../components/admin/CadastroBrigadista';
import { Users, Plus, Search, Trash2 } from 'lucide-react';

const AdminBrigadistas: React.FC = () => {
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [pesquisa, setPesquisa] = useState('');
  const [brigadistaSelecionado, setBrigadistaSelecionado] = useState<string | null>(null);
  const { brigadistas, removerBrigadista } = useAgenda();

  // Filtra brigadistas conforme texto de pesquisa
  const brigadistasFiltrados = brigadistas.filter(b => 
    b.nome.toLowerCase().includes(pesquisa.toLowerCase()) || 
    b.cpf.includes(pesquisa.replace(/\D/g, ''))
  );

  const formatarCPF = (cpf: string) => {
    if (!cpf) return '';
    cpf = cpf.replace(/\D/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleExcluir = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este brigadista? Esta ação não pode ser desfeita.')) {
      removerBrigadista(id);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Users className="mr-3 h-6 w-6 text-yellow-500" />
          <h1 className="text-2xl font-bold text-white">Gerenciar Brigadistas</h1>
        </div>

        <button
          onClick={() => setMostrarCadastro(true)}
          className="flex items-center rounded-md bg-yellow-600 px-4 py-2 font-medium text-white transition-colors hover:bg-yellow-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Brigadista
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
            placeholder="Buscar por nome ou CPF..."
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
                  CPF
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-300">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 bg-gray-800">
              {brigadistasFiltrados.length > 0 ? (
                brigadistasFiltrados.map((brigadista) => (
                  <tr key={brigadista.id} className="transition-colors hover:bg-gray-700">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">
                      {brigadista.nome}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                      {formatarCPF(brigadista.cpf)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <button
                        onClick={() => handleExcluir(brigadista.id)}
                        className="rounded p-1 text-gray-400 transition-colors hover:bg-red-900/30 hover:text-red-400"
                        aria-label="Excluir"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-400">
                    {pesquisa ? 'Nenhum brigadista encontrado com esta pesquisa.' : 'Nenhum brigadista cadastrado.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mostrarCadastro && (
        <CadastroBrigadista onClose={() => setMostrarCadastro(false)} />
      )}
    </div>
  );
};

export default AdminBrigadistas;