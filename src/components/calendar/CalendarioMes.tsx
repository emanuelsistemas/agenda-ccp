import React, { useState } from 'react';
import { useAgenda } from '../../context/AgendaContext';
import { DiaCulto, Brigadista } from '../../types';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarioMesProps {
  admin?: boolean;
  onDiaSelecionado?: (dia: DiaCulto) => void;
}

const CalendarioMes: React.FC<CalendarioMesProps> = ({ admin = false, onDiaSelecionado }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { diasCulto, brigadistas, agendamentos } = useAgenda();
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const diasDoMes = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getDiasCultoNaData = (data: Date): DiaCulto[] => {
    return diasCulto.filter(dia => isSameDay(parseISO(dia.data), data));
  };

  const getBrigadistasAgendados = (diaCultoId: string): Brigadista[] => {
    const agendamentosNoDia = agendamentos.filter(a => a.diaCultoId === diaCultoId);
    return agendamentosNoDia.map(a => {
      const brigadista = brigadistas.find(b => b.id === a.brigadistaId);
      return brigadista!;
    }).filter(Boolean);
  };

  return (
    <div className="rounded-lg bg-gray-800 p-4 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center text-xl font-semibold text-white">
          <CalendarIcon className="mr-2 h-6 w-6 text-yellow-500" />
          <h2>
            {format(currentDate, 'MMMM yyyy', { locale: ptBR }).charAt(0).toUpperCase() + 
             format(currentDate, 'MMMM yyyy', { locale: ptBR }).slice(1)}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={prevMonth}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={nextMonth}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-400">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
          <div key={dia} className="py-2">
            {dia}
          </div>
        ))}
      </div>
      
      <div className="mt-2 grid grid-cols-7 gap-1">
        {diasDoMes.map(dia => {
          const diasCultoNaData = getDiasCultoNaData(dia);
          const temCulto = diasCultoNaData.length > 0;
          
          return (
            <div 
              key={dia.toISOString()}
              className={`aspect-square rounded-md p-1 transition-colors
                ${isToday(dia) ? 'bg-blue-900/30 font-bold text-blue-400' : ''}
                ${temCulto ? 'cursor-pointer bg-gray-700/50 font-medium text-white hover:bg-gray-700' : 'text-gray-500'}
              `}
              onClick={() => {
                if (temCulto && onDiaSelecionado) {
                  onDiaSelecionado(diasCultoNaData[0]);
                }
              }}
            >
              <div className="flex h-full flex-col">
                <div className="text-right text-xs">{format(dia, 'd')}</div>
                
                {temCulto && (
                  <div className="mt-auto flex flex-col space-y-1">
                    {diasCultoNaData.map(diaCulto => {
                      const brigadistasAgendados = getBrigadistasAgendados(diaCulto.id);
                      const vagasPreenchidas = brigadistasAgendados.length;
                      const vagasTotal = diaCulto.brigadistasNecessarios;
                      
                      return (
                        <div 
                          key={diaCulto.id} 
                          className="mt-1 rounded-sm bg-yellow-800/40 px-1 py-0.5 text-left text-xs text-yellow-200"
                        >
                          <div className="truncate">{diaCulto.titulo}</div>
                          <div className="text-2xs mt-0.5 text-yellow-400/80">
                            {vagasPreenchidas}/{vagasTotal} brigadistas
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarioMes;