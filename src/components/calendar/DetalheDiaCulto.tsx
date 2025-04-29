import React, { useState } from 'react';
import { useAgenda } from '../../context/AgendaContext';
import { DiaCulto, Brigadista } from '../../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, Users, X } from 'lucide-react';

interface DetalheDiaCultoProps {
  diaCulto: DiaCulto;
  onClose: () => void;
  isAdmin?: boolean;
}

const DetalheDiaCulto: React.FC<DetalheDiaCultoProps> = ({ diaCulto, onClose, isAdmin = false }) => {
  const [cpf, setCpf] = useState('');
  const [cpfCancelar, setCpfCancelar] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { 
    brigadistas, 
    agendamentos, 
    realizarAgendamento, 
    cancelarAgendamento,
    getBrigadistaPorCpf
  } = useAgenda();

  const agendamentosNoDia = agendamentos.filter(a => a.diaCultoId === diaCulto.id);
  
  const brigadistasAgendados = agendamentosNoDia.map(a => {
    const brigadista = brigadistas.find(b => b.id === a.brigadistaId);
    return { agendamento: a, brigadista };
  }).filter(item => item.brigadista);

  const vagasPreenchidas = brigadistasAgendados.length;
  const vagasDisponiveis = diaCulto.brigadistasNecessarios - vagasPreenchidas;

  const handleAgendar = () => {
    setError('');
    setSuccess('');

    if (!cpf) {
      setError('Por favor, informe seu CPF');
      return;
    }

    const brigadista = getBrigadistaPorCpf(cpf);
    if (!brigadista) {
      setError('CPF não encontrado. Verifique se está cadastrado como brigadista.');
      return;
    }

    const jaAgendado = brigadistasAgendados.some(
      item => item.brigadista?.id === brigadista.id
    );

    if (jaAgendado) {
      setError('Você já está agendado para este culto.');
      return;
    }

    if (vagasDisponiveis <= 0) {
      setError('Não há vagas disponíveis para este culto.');
      return;
    }

    const success = realizarAgendamento(diaCulto.id, cpf);
    
    if (success) {
      setSuccess('Agendamento realizado com sucesso!');
      setCpf('');
    } else {
      setError('Não foi possível realizar o agendamento. Tente novamente.');
    }
  };

  const handleCancelar = (agendamentoId: string) => {
    setError('');
    setSuccess('');

    if (!cpfCancelar) {
      setError('Por favor, informe seu CPF para cancelar');
      return;
    }

    const success = cancelarAgendamento(agendamentoId, cpfCancelar);
    
    if (success) {
      setSuccess('Agendamento cancelado com sucesso!');
      setCpfCancelar('');
    } else {
      setError('Não foi possível cancelar o agendamento. Verifique o CPF informado.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-lg bg-gray-800 shadow-xl">
        <div className="relative rounded-t-lg bg-gray-700 p-4">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-600 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          
          <h2 className="text-xl font-bold text-white">{diaCulto.titulo}</h2>
          
          <div className="mt-2 flex flex-col space-y-2">
            <div className="flex items-center text-gray-300">
              <Calendar className="mr-2 h-4 w-4 text-yellow-500" />
              <span>
                {format(parseISO(diaCulto.data), "EEEE, d 'de' MMMM", { locale: ptBR }).charAt(0).toUpperCase() + 
                 format(parseISO(diaCulto.data), "EEEE, d 'de' MMMM", { locale: ptBR }).slice(1)}
              </span>
            </div>
            
            <div className="flex items-center text-gray-300">
              <Clock className="mr-2 h-4 w-4 text-yellow-500" />
              <span>{diaCulto.horario}</span>
            </div>
            
            <div className="flex items-center text-gray-300">
              <Users className="mr-2 h-4 w-4 text-yellow-500" />
              <span>
                {vagasPreenchidas}/{diaCulto.brigadistasNecessarios} brigadistas escalados
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {error && (
            <div className="mb-4 rounded bg-red-900/50 p-3 text-white">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 rounded bg-green-900/50 p-3 text-white">
              {success}
            </div>
          )}

          <h3 className="mb-3 font-semibold text-white">Brigadistas Escalados</h3>
          
          {brigadistasAgendados.length > 0 ? (
            <div className="mb-4 space-y-2">
              {brigadistasAgendados.map(({ agendamento, brigadista }) => (
                <div 
                  key={agendamento.id}
                  className="flex items-center justify-between rounded-md bg-gray-700 p-3"
                >
                  <div>
                    <p className="font-medium text-white">{brigadista?.nome}</p>
                    <p className="text-sm text-gray-400">CPF: {brigadista?.cpf}</p>
                  </div>
                  
                  {!isAdmin && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Seu CPF"
                        className="w-24 rounded-md border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-white placeholder-gray-500"
                        value={cpfCancelar}
                        onChange={(e) => setCpfCancelar(e.target.value)}
                      />
                      <button
                        onClick={() => handleCancelar(agendamento.id)}
                        className="rounded-md bg-red-800 px-2 py-1 text-xs text-white transition-colors hover:bg-red-700"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="mb-4 text-gray-400">Nenhum brigadista escalado ainda.</p>
          )}

          {!isAdmin && vagasDisponiveis > 0 && (
            <div className="mt-4">
              <h3 className="mb-3 font-semibold text-white">Agendar-se como Brigadista</h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Seu CPF"
                  className="flex-1 rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-500"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                />
                <button
                  onClick={handleAgendar}
                  className="rounded-md bg-yellow-600 px-4 py-2 font-medium text-white transition-colors hover:bg-yellow-700"
                >
                  Agendar
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-400">
                Digite seu CPF para se agendar como brigadista para este culto.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetalheDiaCulto;