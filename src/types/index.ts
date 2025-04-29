export interface User {
  id: string;
  nome: string;
  email: string;
  senha: string;
  isAdmin: boolean;
  ministerioId?: string;
}

export interface Ministerio {
  id: string;
  nome: string;
  tipo: string;
  descricao?: string;
  createdAt: string;
}

export interface Brigadista {
  id: string;
  nome: string;
  cpf: string;
  ministerioId: string;
}

export interface DiaCulto {
  id: string;
  data: string; // formato ISO
  titulo: string;
  horario: string;
  brigadistasNecessarios: number;
  ministerioId: string;
}

export interface Agendamento {
  id: string;
  diaCultoId: string;
  brigadistaId: string;
  dataAgendamento: string; // formato ISO
  ministerioId: string;
}