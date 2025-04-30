import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Calendar, Check } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface Schedule {
  id: string;
  date: string;
  title: string;
  description: string;
  admin: {
    nome_admin: string;
    nome_ministerio: string;
  };
  isAssigned?: boolean;
}

export default function ProfileScreen() {
  const [cpf, setCpf] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [availableSchedules, setAvailableSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4');
  };

  const validateCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    
    if (numbers.length !== 11) return false;
    
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit > 9) digit = 0;
    if (digit !== parseInt(numbers.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit > 9) digit = 0;
    if (digit !== parseInt(numbers.charAt(10))) return false;
    
    return true;
  };

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    setCpf(formatted.slice(0, 14));
    setError('');
    setSearchPerformed(false);
  };

  const fetchUserSchedules = async () => {
    try {
      setError('');
      setIsLoading(true);
      setSearchPerformed(true);

      const cleanCPF = cpf.replace(/\D/g, '');
      if (!validateCPF(cleanCPF)) {
        setError('CPF inválido');
        setSchedules([]);
        setAvailableSchedules([]);
        return;
      }

      // First, get the user's ID using the CPF
      const { data: userData, error: userError } = await supabase
        .from('profiles_user')
        .select('id, admin_id')
        .eq('cpf', cleanCPF)
        .eq('status', 'active')
        .single();

      if (userError) {
        if (userError.code === 'PGRST116') {
          setError(`Nenhuma escala encontrada para o CPF ${cpf}`);
        } else {
          throw userError;
        }
        return;
      }

      setUserId(userData.id);

      // Get user's current assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('schedule_assignments')
        .select(`
          schedules (
            id,
            date,
            title,
            description,
            profiles (
              nome_admin,
              nome_ministerio
            )
          )
        `)
        .eq('user_id', userData.id);

      if (assignmentsError) throw assignmentsError;

      const formattedSchedules = assignmentsData
        ?.map(item => ({
          id: item.schedules.id,
          date: item.schedules.date,
          title: item.schedules.title,
          description: item.schedules.description,
          admin: {
            nome_admin: item.schedules.profiles.nome_admin,
            nome_ministerio: item.schedules.profiles.nome_ministerio
          }
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

      setSchedules(formattedSchedules);

      // Get all future schedules from user's ministry
      const { data: allSchedules, error: schedulesError } = await supabase
        .from('schedules')
        .select(`
          id,
          date,
          title,
          description,
          profiles (
            nome_admin,
            nome_ministerio
          )
        `)
        .eq('admin_id', userData.admin_id)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (schedulesError) throw schedulesError;

      // Get user's assigned schedules
      const { data: userAssignments, error: userAssignmentsError } = await supabase
        .from('schedule_assignments')
        .select('schedule_id')
        .eq('user_id', userData.id);

      if (userAssignmentsError) throw userAssignmentsError;

      const assignedIds = new Set(userAssignments?.map(a => a.schedule_id) || []);

      const formattedAvailableSchedules = allSchedules?.map(schedule => ({
        id: schedule.id,
        date: schedule.date,
        title: schedule.title,
        description: schedule.description,
        admin: {
          nome_admin: schedule.profiles.nome_admin,
          nome_ministerio: schedule.profiles.nome_ministerio
        },
        isAssigned: assignedIds.has(schedule.id)
      })) || [];

      setAvailableSchedules(formattedAvailableSchedules);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erro ao buscar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignToSchedule = async (scheduleId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('schedule_assignments')
        .insert({
          schedule_id: scheduleId,
          user_id: userId
        });

      if (error) {
        if (error.code === '23505') {
          Alert.alert('Aviso', 'Você já está escalado para este culto.');
        } else {
          throw error;
        }
        return;
      }

      // Update local state
      setAvailableSchedules(prev =>
        prev.map(schedule =>
          schedule.id === scheduleId
            ? { ...schedule, isAssigned: true }
            : schedule
        )
      );

      // Refresh user schedules
      fetchUserSchedules();
      Alert.alert('Sucesso', 'Você foi escalado para o culto!');
    } catch (err) {
      console.error('Error assigning to schedule:', err);
      Alert.alert('Erro', 'Não foi possível se escalar para o culto.');
    }
  };

  const handleUnassignFromSchedule = async (scheduleId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('schedule_assignments')
        .delete()
        .eq('schedule_id', scheduleId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setAvailableSchedules(prev =>
        prev.map(schedule =>
          schedule.id === scheduleId
            ? { ...schedule, isAssigned: false }
            : schedule
        )
      );

      // Refresh user schedules
      fetchUserSchedules();
      Alert.alert('Sucesso', 'Você foi removido da escala!');
    } catch (err) {
      console.error('Error unassigning from schedule:', err);
      Alert.alert('Erro', 'Não foi possível remover sua escala.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Área de escalas</Text>
          <Text style={styles.subtitle}>Consulte e gerencie suas escalas</Text>
        </View>

        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Consultar Escala</Text>
          <View style={styles.searchCard}>
            <Text style={styles.label}>Digite seu CPF</Text>
            <TextInput
              style={[
                styles.input,
                error && error.includes('inválido') && styles.inputError,
                !error && searchPerformed && styles.inputSuccess
              ]}
              value={cpf}
              onChangeText={handleCPFChange}
              placeholder="000.000.000-00"
              placeholderTextColor="#666"
              keyboardType="numeric"
              maxLength={14}
            />
            {error ? (
              <Text style={[
                styles.feedbackText,
                error.includes('inválido') ? styles.errorText : styles.warningText
              ]}>
                {error}
              </Text>
            ) : searchPerformed ? (
              <Text style={styles.successText}>CPF válido</Text>
            ) : null}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={fetchUserSchedules}
              disabled={isLoading}>
              <Search size={20} color="#fff" />
              <Text style={styles.buttonText}>
                {isLoading ? 'Buscando...' : 'Verificar Escala'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {availableSchedules.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cultos Disponíveis</Text>
            <View style={styles.cardList}>
              {availableSchedules.map((schedule) => (
                <View key={schedule.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Calendar size={16} color="#60A5FA" />
                    <Text style={styles.cardDate}>
                      {new Date(schedule.date).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                  <Text style={styles.cardTitle}>{schedule.title}</Text>
                  {schedule.description && (
                    <Text style={styles.cardDescription}>{schedule.description}</Text>
                  )}
                  <View style={styles.ministryInfo}>
                    <Text style={styles.ministryName}>{schedule.admin.nome_ministerio}</Text>
                    <Text style={styles.adminName}>Líder: {schedule.admin.nome_admin}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.assignButton,
                      schedule.isAssigned && styles.unassignButton
                    ]}
                    onPress={() => schedule.isAssigned
                      ? handleUnassignFromSchedule(schedule.id)
                      : handleAssignToSchedule(schedule.id)
                    }>
                    {schedule.isAssigned ? (
                      <>
                        <Check size={20} color="#fff" />
                        <Text style={styles.assignButtonText}>Escalado</Text>
                      </>
                    ) : (
                      <Text style={styles.assignButtonText}>Escalar-se</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {schedules.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suas Escalas</Text>
            <View style={styles.cardList}>
              {schedules.map((schedule) => (
                <View key={schedule.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Calendar size={16} color="#60A5FA" />
                    <Text style={styles.cardDate}>
                      {new Date(schedule.date).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                  <Text style={styles.cardTitle}>{schedule.title}</Text>
                  {schedule.description && (
                    <Text style={styles.cardDescription}>{schedule.description}</Text>
                  )}
                  <View style={styles.ministryInfo}>
                    <Text style={styles.ministryName}>{schedule.admin.nome_ministerio}</Text>
                    <Text style={styles.adminName}>Líder: {schedule.admin.nome_admin}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  welcomeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: '#fff',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#60A5FA',
    marginTop: 4,
  },
  searchSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#fff',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  searchCard: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  label: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#262626',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontFamily: 'Inter_400Regular',
  },
  inputError: {
    borderColor: '#f87171',
  },
  inputSuccess: {
    borderColor: '#34D399',
  },
  button: {
    backgroundColor: '#60A5FA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 8,
  },
  feedbackText: {
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
  },
  errorText: {
    color: '#f87171',
  },
  warningText: {
    color: '#FBBF24',
  },
  successText: {
    color: '#34D399',
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
  },
  section: {
    marginTop: 32,
  },
  cardList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardDate: {
    color: '#60A5FA',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 8,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  cardDescription: {
    color: '#999',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 12,
  },
  ministryInfo: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
  },
  ministryName: {
    color: '#60A5FA',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  adminName: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  assignButton: {
    backgroundColor: '#60A5FA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  unassignButton: {
    backgroundColor: '#34D399',
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 8,
  },
});