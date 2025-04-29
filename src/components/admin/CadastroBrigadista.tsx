import React, { useState } from 'react';
import { useAgenda } from '../../context/AgendaContext';
import { X, UserPlus } from 'lucide-react';

interface CadastroBrigadistaProps {
  onClose: () => void;
}

const CadastroBrigadista: React.FC<CadastroBrigadistaProps> = ({ onClose }) => {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');
  const { adicionarBrigadista, brigadistas } = useAgenda();

  const formatarCPF = (valor: string) => {
    // Remove tudo que não é dígito
    valor = valor.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    valor = valor.substring(0, 11);
    
    // Formata o CPF no formato XXX.XXX.XXX-XX
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    
    return valor;
  };

  const handleChangeCPF = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarCPF(e.target.value);
    setCpf(valorFormatado);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nome || !cpf) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    // Remove formatação para armazenar apenas os números
    const cpfNumeros = cpf.replace(/\D/g, '');
    
    if (cpfNumeros.length !== 11) {
      setError('CPF inválido. O CPF deve conter 11 dígitos.');
      return;
    }

    // Verifica se o CPF já está cadastrado
    const cpfExistente = brigadistas.some(b => b.cpf === cpfNumeros);
    if (cpfExistente) {
      setError('Este CPF já está cadastrado.');
      return;
    }

    const success = adicionarBrigadista({
      nome,
      cpf: cpfNumeros
    });

    if (success) {
      onClose();
    } else {
      setError('Erro ao cadastrar brigadista. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-lg bg-gray-800 shadow-xl">
        <div className="flex items-center justify-between rounded-t-lg bg-gray-700 p-4">
          <h2 className="text-xl font-bold text-white">Cadastrar Novo Brigadista</h2>
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
            <label htmlFor="nome" className="mb-1 block text-sm font-medium text-gray-300">
              Nome Completo
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-700 p-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
              placeholder="Nome do Brigadista"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="cpf" className="mb-1 block text-sm font-medium text-gray-300">
              CPF
            </label>
            <input
              id="cpf"
              type="text"
              value={cpf}
              onChange={handleChangeCPF}
              className="w-full rounded-md border border-gray-700 bg-gray-700 p-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
              placeholder="000.000.000-00"
              required
            />
            <p className="mt-1 text-xs text-gray-400">
              O CPF será usado para identificação no agendamento e cancelamento.
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
              className="flex items-center rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-700"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroBrigadista;