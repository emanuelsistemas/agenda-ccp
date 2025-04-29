import React, { useState } from 'react';
import CalendarioMes from '../../components/calendar/CalendarioMes';
import DetalheDiaCulto from '../../components/calendar/DetalheDiaCulto';
import CadastroDiaCulto from '../../components/admin/CadastroDiaCulto';
import { DiaCulto } from '../../types';
import { useAgenda } from '../../context/AgendaContext';
import { Calendar, Plus, Trash2 } from 'lucide-react';

const AdminCalendario: React.FC = () => {
  const [diaSelecionado, setDiaSelecionado] = useState<DiaCulto | null>(null);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const { removerDiaCulto } = useAgenda();

  const handleExcluir = () => {
    if (diaSelecionado) {
      removerDiaCulto(diaSelecionado.id);
      setDiaSelecionado(null);
      setMostrarConfirmacao(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Calendar className="mr-3 h-6 w-6 text-yellow-500" />
          <h1 className="text-2xl font-bold text-white">Gerenciar Calendário</h1>
        </div>

        <button
          onClick={() => setMostrarCadastro(true)}
          className="flex items-center rounded-md bg-yellow-600 px-4 py-2 font-medium text-white transition-colors hover:bg-yellow-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Culto
        </button>
      </div>

      <div className="rounded-lg bg-gray-800/70 p-4 shadow-md">
        <p className="mb-6 text-gray-300">
          Gerencie os dias de culto no calendário. Clique em um dia para ver detalhes ou excluir.
        </p>

        <CalendarioMes admin onDiaSelecionado={setDiaSelecionado} />
      </div>

      {diaSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-lg bg-gray-800 shadow-xl">
            <DetalheDiaCulto 
              diaCulto={diaSelecionado} 
              onClose={() => setDiaSelecionado(null)}
              isAdmin
            />
            
            <div className="border-t border-gray-700 p-4">
              <button
                onClick={() => setMostrarConfirmacao(true)}
                className="flex w-full items-center justify-center rounded-md bg-red-800 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Culto
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarConfirmacao && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm rounded-lg bg-gray-800 p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-white">Confirmar Exclusão</h3>
            <p className="mb-6 text-gray-300">
              Tem certeza que deseja excluir este culto? Esta ação não pode ser desfeita e todos os agendamentos relacionados serão removidos.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setMostrarConfirmacao(false)}
                className="rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleExcluir}
                className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarCadastro && (
        <CadastroDiaCulto onClose={() => setMostrarCadastro(false)} />
      )}
    </div>
  );
};

export default AdminCalendario;