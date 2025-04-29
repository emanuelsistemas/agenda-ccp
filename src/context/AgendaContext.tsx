import React, { createContext, useState, useContext, useEffect } from 'react';
import { DiaCulto, Brigadista, Agendamento } from '../types';

interface AgendaContextType {
  diasCulto: DiaCulto[];
  brigadistas: Brigadista[];
  agendamentos: Agendamento[];
  adicionarDiaCulto: (diaCulto: Omit<DiaCulto, 'id'>) => void;
  removerDiaCulto: (id: string) => void;
  adicionarBrigadista: (brigadista: Omit<Brigadista, 'id'>) => void;
  removerBrigadista: (id: string) => void;
  realizarAgendamento: (diaCultoId: string, cpf: string) => boolean;
  cancelarAgendamento: (agendamentoId: string, cpf: string) => boolean;
  getBrigadistaPorCpf: (cpf: string) => Brigadista | undefined;
  getAgendamentosPorDia: (diaCultoId: string) => Agendamento[];
}

// Mock data inicial
const DIAS_CULTO_MOCK: DiaCulto[] = [
  {
    id: '1',
    data: '2025-05-04T00:00:00.000Z',
    titulo: 'Culto de Domingo',
    horario: '18:00',
    brigadistasNecessarios: 3
  },
  {
    id: '2',
    data: '2025-05-07T00:00:00.000Z',
    titulo: 'Culto de Quarta',
    horario: '19:30',
    brigadistasNecessarios: 2
  }
];

const BRIGADISTAS_MOCK: Brigadista[] = [
  { id: '1', nome: 'João Silva', cpf: '12345678900' },
  { id: '2', nome: 'Maria Oliveira', cpf: '98765432100' }
];

const AGENDAMENTOS_MOCK: Agendamento[] = [
  { 
    id: '1', 
    diaCultoId: '1', 
    brigadistaId: '1', 
    dataAgendamento: '2025-05-01T10:30:00.000Z' 
  }
];

const AgendaContext = createContext<AgendaContextType | undefined>(undefined);

export const AgendaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [diasCulto, setDiasCulto] = useState<DiaCulto[]>([]);
  const [brigadistas, setBrigadistas] = useState<Brigadista[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  useEffect(() => {
    // Carregar dados iniciais do localStorage ou usar mocks
    const storedDiasCulto = localStorage.getItem('diasCulto');
    const storedBrigadistas = localStorage.getItem('brigadistas');
    const storedAgendamentos = localStorage.getItem('agendamentos');

    setDiasCulto(storedDiasCulto ? JSON.parse(storedDiasCulto) : DIAS_CULTO_MOCK);
    setBrigadistas(storedBrigadistas ? JSON.parse(storedBrigadistas) : BRIGADISTAS_MOCK);
    setAgendamentos(storedAgendamentos ? JSON.parse(storedAgendamentos) : AGENDAMENTOS_MOCK);
  }, []);

  // Salvar dados no localStorage quando mudarem
  useEffect(() => {
    localStorage.setItem('diasCulto', JSON.stringify(diasCulto));
    localStorage.setItem('brigadistas', JSON.stringify(brigadistas));
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
  }, [diasCulto, brigadistas, agendamentos]);

  const adicionarDiaCulto = (diaCulto: Omit<DiaCulto, 'id'>) => {
    const novoDiaCulto: DiaCulto = {
      ...diaCulto,
      id: Date.now().toString()
    };
    setDiasCulto([...diasCulto, novoDiaCulto]);
  };

  const removerDiaCulto = (id: string) => {
    setDiasCulto(diasCulto.filter(dia => dia.id !== id));
    // Remover também os agendamentos relacionados
    setAgendamentos(agendamentos.filter(a => a.diaCultoId !== id));
  };

  const adicionarBrigadista = (brigadista: Omit<Brigadista, 'id'>) => {
    // Verificar se CPF já existe
    if (brigadistas.some(b => b.cpf === brigadista.cpf)) {
      return false;
    }
    
    const novoBrigadista: Brigadista = {
      ...brigadista,
      id: Date.now().toString()
    };
    setBrigadistas([...brigadistas, novoBrigadista]);
    return true;
  };

  const removerBrigadista = (id: string) => {
    setBrigadistas(brigadistas.filter(b => b.id !== id));
    // Remover também os agendamentos relacionados
    setAgendamentos(agendamentos.filter(a => a.brigadistaId !== id));
  };

  const getBrigadistaPorCpf = (cpf: string): Brigadista | undefined => {
    return brigadistas.find(b => b.cpf === cpf);
  };

  const realizarAgendamento = (diaCultoId: string, cpf: string): boolean => {
    const brigadista = getBrigadistaPorCpf(cpf);
    if (!brigadista) return false;

    // Verificar se já existe agendamento para este brigadista neste dia
    const agendamentoExistente = agendamentos.find(
      a => a.diaCultoId === diaCultoId && a.brigadistaId === brigadista.id
    );
    if (agendamentoExistente) return false;

    // Verificar se já atingiu o número máximo de brigadistas
    const diaCulto = diasCulto.find(d => d.id === diaCultoId);
    if (!diaCulto) return false;
    
    const agendamentosNesteDia = agendamentos.filter(a => a.diaCultoId === diaCultoId);
    if (agendamentosNesteDia.length >= diaCulto.brigadistasNecessarios) return false;

    const novoAgendamento: Agendamento = {
      id: Date.now().toString(),
      diaCultoId,
      brigadistaId: brigadista.id,
      dataAgendamento: new Date().toISOString()
    };

    setAgendamentos([...agendamentos, novoAgendamento]);
    return true;
  };

  const cancelarAgendamento = (agendamentoId: string, cpf: string): boolean => {
    const agendamento = agendamentos.find(a => a.id === agendamentoId);
    if (!agendamento) return false;

    const brigadista = brigadistas.find(b => b.id === agendamento.brigadistaId);
    if (!brigadista || brigadista.cpf !== cpf) return false;

    setAgendamentos(agendamentos.filter(a => a.id !== agendamentoId));
    return true;
  };

  const getAgendamentosPorDia = (diaCultoId: string): Agendamento[] => {
    return agendamentos.filter(a => a.diaCultoId === diaCultoId);
  };

  const value = {
    diasCulto,
    brigadistas,
    agendamentos,
    adicionarDiaCulto,
    removerDiaCulto,
    adicionarBrigadista,
    removerBrigadista,
    realizarAgendamento,
    cancelarAgendamento,
    getBrigadistaPorCpf,
    getAgendamentosPorDia
  };

  return (
    <AgendaContext.Provider value={value}>
      {children}
    </AgendaContext.Provider>
  );
};

export const useAgenda = (): AgendaContextType => {
  const context = useContext(AgendaContext);
  if (context === undefined) {
    throw new Error('useAgenda deve ser usado dentro de um AgendaProvider');
  }
  return context;
};