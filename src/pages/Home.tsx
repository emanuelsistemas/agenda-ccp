import React, { useState } from 'react';
import CalendarioMes from '../components/calendar/CalendarioMes';
import DetalheDiaCulto from '../components/calendar/DetalheDiaCulto';
import { DiaCulto } from '../types';
import { Calendar } from 'lucide-react';

const Home: React.FC = () => {
  const [diaSelecionado, setDiaSelecionado] = useState<DiaCulto | null>(null);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center">
        <Calendar className="mr-3 h-6 w-6 text-yellow-500" />
        <h1 className="text-2xl font-bold text-white">Agenda de Escala de Brigadistas</h1>
      </div>

      <div className="rounded-lg bg-gray-800/70 p-4 shadow-md">
        <p className="mb-6 text-gray-300">
          Selecione um dia com culto no calendário para visualizar detalhes e se inscrever como brigadista.
        </p>

        <CalendarioMes onDiaSelecionado={setDiaSelecionado} />
      </div>

      {diaSelecionado && (
        <DetalheDiaCulto 
          diaCulto={diaSelecionado} 
          onClose={() => setDiaSelecionado(null)} 
        />
      )}
    </div>
  );
};

export default Home;