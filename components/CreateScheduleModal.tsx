import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface CreateScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  adminId: string;
}

interface DaySchedule {
  date: Date;
  title: string;
  selected: boolean;
}

export function CreateScheduleModal({ visible, onClose, onSuccess, adminId }: CreateScheduleModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState<DaySchedule[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      const today = new Date();
      setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
      setSelectedDays([]);
    }
  }, [visible]);

  const getDayOfWeek = (date: Date) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[date.getDay()];
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days: DaySchedule[] = [];
    
    // Add empty days for padding
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ date: new Date(), title: '', selected: false });
    }
    
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      const dayOfWeek = getDayOfWeek(currentDate);
      const isSunday = currentDate.getDay() === 0;
      
      days.push({
        date: currentDate,
        title: isSunday ? 'Culto de Celebração' : `Culto Regular de ${dayOfWeek}`,
        selected: false
      });
    }
    
    return days;
  };

  const handleDayPress = (day: DaySchedule) => {
    if (!day.date) return;
    
    setSelectedDays(prev => {
      const exists = prev.find(d => 
        d.date.getFullYear() === day.date.getFullYear() &&
        d.date.getMonth() === day.date.getMonth() &&
        d.date.getDate() === day.date.getDate()
      );

      if (exists) {
        return prev.filter(d => 
          d.date.getFullYear() !== day.date.getFullYear() ||
          d.date.getMonth() !== day.date.getMonth() ||
          d.date.getDate() !== day.date.getDate()
        );
      }

      return [...prev, { ...day, selected: true }];
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const checkExistingSchedule = async (date: string) => {
    const { data } = await supabase
      .from('schedules')
      .select('id')
      .eq('admin_id', adminId)
      .eq('date', date);
    
    return data && data.length > 0;
  };

  const handleSave = async () => {
    try {
      setError('');
      setIsLoading(true);

      if (selectedDays.length === 0) {
        setError('Selecione pelo menos um dia');
        return;
      }

      const failedDates: string[] = [];
      const successfulDates: string[] = [];

      for (const day of selectedDays) {
        const formattedDate = day.date.toISOString().split('T')[0];
        const isSunday = day.date.getDay() === 0;
        const hasExistingSchedule = await checkExistingSchedule(formattedDate);

        if (hasExistingSchedule) {
          failedDates.push(formattedDate);
          continue;
        }

        try {
          if (isSunday) {
            // Create morning service
            const { error: morningError } = await supabase
              .from('schedules')
              .insert({
                admin_id: adminId,
                date: formattedDate,
                title: `${day.title} - Manhã`,
                description: 'Culto de Celebração - Manhã'
              });

            if (morningError) throw morningError;

            // Create evening service
            const { error: eveningError } = await supabase
              .from('schedules')
              .insert({
                admin_id: adminId,
                date: formattedDate,
                title: `${day.title} - Noite`,
                description: 'Culto de Celebração - Noite'
              });

            if (eveningError) throw eveningError;

          } else {
            // Create regular service
            const { error: insertError } = await supabase
              .from('schedules')
              .insert({
                admin_id: adminId,
                date: formattedDate,
                title: day.title,
                description: 'Culto regular'
              });

            if (insertError) throw insertError;
          }

          successfulDates.push(formattedDate);
        } catch (err) {
          failedDates.push(formattedDate);
          console.error('Error creating schedule:', err);
        }
      }

      if (failedDates.length > 0) {
        setError(`Já existem eventos agendados para as datas: ${failedDates.map(date => new Date(date).toLocaleDateString()).join(', ')}`);
      }

      if (successfulDates.length > 0) {
        onSuccess();
        if (failedDates.length === 0) {
          onClose();
        }
      }
    } catch (err) {
      console.error('Error saving schedule:', err);
      setError('Erro ao salvar agenda');
    } finally {
      setIsLoading(false);
    }
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Criar Agenda</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={handlePrevMonth}>
              <ChevronLeft size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {monthName} {currentDate.getFullYear()}
            </Text>
            <TouchableOpacity onPress={handleNextMonth}>
              <ChevronRight size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDays}>
            {weekDays.map((day, index) => (
              <Text key={index} style={[
                styles.weekDay,
                index === 0 && styles.sundayText
              ]}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.calendar}>
            {days.map((day, index) => {
              const isSunday = day.date && day.date.getDay() === 0;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.day,
                    !day.date && styles.emptyDay,
                    selectedDays.some(d => 
                      d.date.getFullYear() === day.date?.getFullYear() &&
                      d.date.getMonth() === day.date?.getMonth() &&
                      d.date.getDate() === day.date?.getDate()
                    ) && styles.selectedDay,
                    isSunday && styles.sundayDay
                  ]}
                  onPress={() => handleDayPress(day)}
                  disabled={!day.date}>
                  {day.date && (
                    <>
                      <Text style={[
                        styles.dayText,
                        isSunday && styles.sundayText,
                        selectedDays.some(d => 
                          d.date.getFullYear() === day.date?.getFullYear() &&
                          d.date.getMonth() === day.date?.getMonth() &&
                          d.date.getDate() === day.date?.getDate()
                        ) && styles.selectedDayText
                      ]}>
                        {day.date.getDate()}
                      </Text>
                      {selectedDays.some(d => 
                        d.date.getFullYear() === day.date?.getFullYear() &&
                        d.date.getMonth() === day.date?.getMonth() &&
                        d.date.getDate() === day.date?.getDate()
                      ) && (
                        <View style={styles.checkmark}>
                          <Check size={12} color="#fff" />
                        </View>
                      )}
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isLoading}>
            <Text style={styles.buttonText}>
              {isLoading ? 'Salvando...' : 'Salvar Agenda'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'capitalize',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  emptyDay: {
    backgroundColor: '#1a1a1a',
  },
  selectedDay: {
    backgroundColor: '#60A5FA',
    borderColor: '#60A5FA',
  },
  dayText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  selectedDayText: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
  },
  checkmark: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  button: {
    backgroundColor: '#60A5FA',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  errorText: {
    color: '#f87171',
    marginBottom: 12,
    fontFamily: 'Inter_400Regular',
  },
  sundayText: {
    color: '#f87171',
  },
  sundayDay: {
    borderColor: '#f87171',
  },
});