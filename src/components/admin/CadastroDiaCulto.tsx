import React, { useState } from 'react';
import { useAgenda } from '../../context/AgendaContext';
import { Calendar, Clock, Users, X } from 'lucide-react';

interface CadastroDiaCultoProps {
  onClose: () => void;
}

const CadastroDiaCulto: React.FC<CadastroDiaCultoProps> = ({ onClose }) => {
  const [titulo, setTitulo] = useState('Culto');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('19:00');
  const [brigadistasNecessarios, setBrigadistasNecessarios] = useState(2);
  const [error, setError] = useState('');
  const { adicionarDiaCulto } = useAgenda();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!titulo || !data || !horario || brigadistasNecessarios < 1) {
      setError('Por favor, preencha todos os campos corretamente.');
      return;
    }

    adicionarDiaCulto({
      data: new Date(data).toISOString(),
      titulo,
      horario,
      brigadistasNecessarios
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-lg bg-gray-800 shadow-xl">
        <div className="flex items-center justify-between rounded-t-lg bg-gray-700 p-4">
          <h2 className="text-xl font-bold text-white">Cadastrar Novo Culto</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-600 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 rounded bg-red-900/50 p-3 text-white">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="titulo" className="mb-1 block text-sm font-medium text-gray-300">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-yellow-500" />
                Título do Evento
              </div>
            </label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-700 p-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
              placeholder="Ex: Culto de Domingo"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="data" className="mb-1 block text-sm font-medium text-gray-300">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-yellow-500" />
                Data
              </div>
            </label>
            <input
              id="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-700 p-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="horario" className="mb-1 block text-sm font-medium text-gray-300">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                Horário
              </div>
            </label>
            <input
              id="horario"
              type="time"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-700 p-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="brigadistas" className="mb-1 block text-sm font-medium text-gray-300">
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-yellow-500" />
                Número de Brigadistas Necessários
              </div>
            </label>
            <input
              id="brigadistas"
              type="number"
              min="1"
              max="10"
              value={brigadistasNecessarios}
              onChange={(e) => setBrigadistasNecessarios(parseInt(e.target.value))}
              className="w-full rounded-md border border-gray-700 bg-gray-700 p-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
              required
            />
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
      </div>
    </div>
  );
};

export default CadastroDiaCulto;