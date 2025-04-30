import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Calendar, BellRing } from 'lucide-react-native';
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
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  admin: {
    nome_admin: string;
    nome_ministerio: string;
  };
}

export default function HomeScreen() {
  const [cpf, setCpf] = useState('');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
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
        setAnnouncements([]);
        return;
      }

      // First, get the user's ID using the CPF
      const { data: userData, error: userError } = await supabase
        .from('profiles_user')
        .select('id')
        .eq('cpf', cleanCPF)
        .single();

      if (userError) {
        if (userError.code === 'PGRST116') {
          setError(`Nenhuma agenda encontrada para o CPF ${cpf}`);
        } else {
          throw userError;
        }
        return;
      }

      // Then get the schedules where this user is assigned
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

      // Get announcements from ministries where user is assigned
      if (formattedSchedules.length > 0) {
        const { data: announcementData, error: announcementError } = await supabase
          .from('announcements')
          .select(`
            id,
            title,
            content,
            created_at,
            profiles (
              nome_admin,
              nome_ministerio
            )
          `)
          .eq('active', true)
          .order('created_at', { ascending: false });

        if (announcementError) throw announcementError;

        const formattedAnnouncements = announcementData?.map(item => ({
          id: item.id,
          title: item.title,
          content: item.content,
          created_at: item.created_at,
          admin: {
            nome_admin: item.profiles.nome_admin,
            nome_ministerio: item.profiles.nome_ministerio
          }
        })) || [];

        setAnnouncements(formattedAnnouncements);
      }

      if (formattedSchedules.length === 0) {
        setError(`Nenhuma agenda encontrada para o CPF ${cpf}`);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erro ao buscar dados');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Bem-vindo à</Text>
          <Text style={styles.churchName}>Agenda Catedral da Paz</Text>
        </View>

        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Consultar Agenda</Text>
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
                {isLoading ? 'Buscando...' : 'Verificar Agenda'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {schedules.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suas Agendas</Text>
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

        {announcements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informativos</Text>
            <View style={styles.cardList}>
              {announcements.map((announcement) => (
                <View key={announcement.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <BellRing size={16} color="#60A5FA" />
                    <Text style={styles.cardDate}>
                      {new Date(announcement.created_at).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                  <Text style={styles.cardTitle}>{announcement.title}</Text>
                  <Text style={styles.cardDescription}>{announcement.content}</Text>
                  <View style={styles.ministryInfo}>
                    <Text style={styles.ministryName}>{announcement.admin.nome_ministerio}</Text>
                    <Text style={styles.adminName}>Líder: {announcement.admin.nome_admin}</Text>
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
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#60A5FA',
  },
  churchName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: '#fff',
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
});