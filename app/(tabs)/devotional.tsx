import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogOut, Plus, UserPlus, Pencil, Trash2, Calendar, Users, BellRing } from 'lucide-react-native';
import { CreateUserModal } from '@/components/CreateUserModal';
import { EditUserModal } from '@/components/EditUserModal';
import { CreateScheduleModal } from '@/components/CreateScheduleModal';
import { AssignUsersModal } from '@/components/AssignUsersModal';
import { CreateAnnouncementModal } from '@/components/CreateAnnouncementModal';

interface User {
  id: string;
  nome_usuario: string;
  cpf: string;
  status: 'active' | 'inactive';
  created_at: string;
}

interface Schedule {
  id: string;
  date: string;
  title: string;
  description: string;
  created_at: string;
}

interface Assignment {
  user_id: string;
  nome_usuario: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  active: boolean;
}

export default function AdminScreen() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ministryData, setMinistryData] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [nome_ministerio, setNomeMinisterio] = useState('');
  const [tipo_ministerio, setTipoMinisterio] = useState('');
  const [descricao, setDescricao] = useState('');
  const [nome_admin, setNomeAdmin] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);
  const [showAssignUsers, setShowAssignUsers] = useState(false);
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [userCount, setUserCount] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [assignments, setAssignments] = useState<Record<string, Assignment[]>>({});

  const fetchAssignments = async (scheduleId: string) => {
    try {
      const { data, error } = await supabase
        .from('schedule_assignments')
        .select(`
          user_id,
          profiles_user (nome_usuario)
        `)
        .eq('schedule_id', scheduleId);

      if (error) throw error;

      const formattedAssignments = data.map(assignment => ({
        user_id: assignment.user_id,
        nome_usuario: assignment.profiles_user.nome_usuario
      }));

      setAssignments(prev => ({
        ...prev,
        [scheduleId]: formattedAssignments
      }));
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('admin_id', ministryData.id)
        .order('date', { ascending: true });

      if (error) throw error;
      
      setSchedules(data || []);

      data?.forEach(schedule => {
        fetchAssignments(schedule.id);
      });
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('admin_id', ministryData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles_user')
        .select('*')
        .eq('admin_id', ministryData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setUsers(data || []);
      setUserCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const checkAdminStatus = async () => {
    setIsLoading(true);
    try {
      const session = await AsyncStorage.getItem('@user_session');
      const userData = await AsyncStorage.getItem('@user_data');

      if (session && userData) {
        const parsedUserData = JSON.parse(userData);
        setIsAdmin(parsedUserData.tipo_user === 'S');
        setMinistryData(parsedUserData);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Erro ao verificar status de administrador:', error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (ministryData?.id) {
      fetchUsers();
      fetchSchedules();
      fetchAnnouncements();
    }
  }, [ministryData]);

  const handleLogin = async () => {
    try {
      setLoginError('');
      setLoginLoading(true);

      if (!email.trim() || !password.trim()) {
        setLoginError('Preencha todos os campos');
        return;
      }

      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (error) {
        setLoginError('Email ou senha incorretos');
        return;
      }

      if (session) {
        await AsyncStorage.setItem('@user_session', JSON.stringify(session));
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          await AsyncStorage.setItem('@user_data', JSON.stringify(profile));
          setIsAdmin(profile.tipo_user === 'S');
          setMinistryData(profile);
        }
      }
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setLoginError('Erro ao fazer login');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setLoginError('');
      setLoginLoading(true);

      if (!email.trim() || !password.trim() || !nome_ministerio.trim() || 
          !tipo_ministerio.trim() || !nome_admin.trim()) {
        setLoginError('Preencha todos os campos obrigatórios');
        return;
      }

      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      });

      if (signUpError) throw signUpError;

      if (!user) {
        setLoginError('Erro ao criar conta');
        return;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            email: email.trim(),
            nome_ministerio: nome_ministerio.trim(),
            tipo_ministerio: tipo_ministerio.trim(),
            descricao: descricao.trim(),
            nome_admin: nome_admin.trim(),
            tipo_user: 'S'
          }
        ]);

      if (profileError) throw profileError;

      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (signInError) throw signInError;

      if (session) {
        await AsyncStorage.setItem('@user_session', JSON.stringify(session));
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          await AsyncStorage.setItem('@user_data', JSON.stringify(profile));
          setIsAdmin(profile.tipo_user === 'S');
          setMinistryData(profile);
        }
      }

      setEmail('');
      setPassword('');
      setNomeMinisterio('');
      setTipoMinisterio('');
      setDescricao('');
      setNomeAdmin('');
      setIsSignUp(false);

    } catch (err) {
      console.error('Erro ao criar conta:', err);
      setLoginError('Erro ao criar conta');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      await AsyncStorage.removeItem('@user_session');
      await AsyncStorage.removeItem('@user_data');
      
      setIsAdmin(false);
      setMinistryData(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const handleCreateSchedule = () => {
    setShowCreateSchedule(true);
  };

  const handleScheduleCreated = () => {
    fetchSchedules();
  };

  const handleUserCreated = () => {
    fetchUsers();
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditUser(true);
  };

  const handleDeleteUser = async (user: User) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este usuário?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('profiles_user')
                .delete()
                .eq('id', user.id)
                .eq('admin_id', ministryData.id);

              if (error) throw error;

              fetchUsers();
            } catch (err) {
              console.error('Error deleting user:', err);
              Alert.alert('Erro', 'Não foi possível excluir o usuário.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteSchedule = async (schedule: Schedule) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta agenda?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('schedules')
                .delete()
                .eq('id', schedule.id)
                .eq('admin_id', ministryData.id);

              if (error) throw error;

              fetchSchedules();
            } catch (err) {
              console.error('Error deleting schedule:', err);
              Alert.alert('Erro', 'Não foi possível excluir a agenda.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteAnnouncement = async (announcement: Announcement) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este informativo?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('announcements')
                .delete()
                .eq('id', announcement.id)
                .eq('admin_id', ministryData.id);

              if (error) throw error;

              fetchAnnouncements();
            } catch (err) {
              console.error('Error deleting announcement:', err);
              Alert.alert('Erro', 'Não foi possível excluir o informativo.');
            }
          }
        }
      ]
    );
  };

  const handleToggleAnnouncementStatus = async (announcement: Announcement) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ active: !announcement.active })
        .eq('id', announcement.id)
        .eq('admin_id', ministryData.id);

      if (error) throw error;

      fetchAnnouncements();
    } catch (err) {
      console.error('Error updating announcement:', err);
      Alert.alert('Erro', 'Não foi possível atualizar o status do informativo.');
    }
  };

  const handleAssignUsers = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowAssignUsers(true);
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.loginContainer}>
            <Text style={styles.loginTitle}>Área Administrativa</Text>
            <Text style={styles.loginSubtitle}>
              {isSignUp ? 'Crie sua conta' : 'Faça login para acessar'}
            </Text>

            {loginError ? (
              <Text style={styles.errorText}>{loginError}</Text>
            ) : null}

            {isSignUp ? (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nome do Ministério</Text>
                  <TextInput
                    style={styles.input}
                    value={nome_ministerio}
                    onChangeText={setNomeMinisterio}
                    placeholder="Digite o nome do ministério"
                    placeholderTextColor="#666"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Tipo do Ministério</Text>
                  <TextInput
                    style={styles.input}
                    value={tipo_ministerio}
                    onChangeText={setTipoMinisterio}
                    placeholder="Digite o tipo do ministério"
                    placeholderTextColor="#666"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Descrição (opcional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={descricao}
                    onChangeText={setDescricao}
                    placeholder="Digite uma descrição"
                    placeholderTextColor="#666"
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nome do Administrador</Text>
                  <TextInput
                    style={styles.input}
                    value={nome_admin}
                    onChangeText={setNomeAdmin}
                    placeholder="Digite seu nome completo"
                    placeholderTextColor="#666"
                  />
                </View>
              </>
            ) : null}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Digite seu email"
                placeholderTextColor="#666"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Digite sua senha"
                placeholderTextColor="#666"
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loginLoading && styles.buttonDisabled]}
              onPress={isSignUp ? handleSignUp : handleLogin}
              disabled={loginLoading}>
              <Text style={styles.loginButtonText}>
                {loginLoading 
                  ? (isSignUp ? 'Criando conta...' : 'Entrando...') 
                  : (isSignUp ? 'Criar Conta' : 'Entrar')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => {
                setIsSignUp(!isSignUp);
                setLoginError('');
              }}>
              <Text style={styles.switchButtonText}>
                {isSignUp 
                  ? 'Já tem uma conta? Faça login' 
                  : 'Não tem uma conta? Crie agora'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Área Administrativa</Text>
            <Text style={styles.subtitle}>Gerencie seu Ministério</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={24} color="#f87171" />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ministrySection}>
          <Text style={styles.sectionTitle}>Informações do Ministério</Text>
          <View style={styles.ministryCard}>
            <View style={styles.ministryInfo}>
              <Text style={styles.label}>Nome do Ministério:</Text>
              <Text style={styles.value}>{ministryData?.nome_ministerio}</Text>
            </View>
            <View style={styles.ministryInfo}>
              <Text style={styles.label}>Tipo:</Text>
              <Text style={styles.value}>{ministryData?.tipo_ministerio}</Text>
            </View>
            <View style={styles.ministryInfo}>
              <Text style={styles.label}>Administrador:</Text>
              <Text style={styles.value}>{ministryData?.nome_admin}</Text>
            </View>
            {ministryData?.descricao && (
              <View style={styles.ministryInfo}>
                <Text style={styles.label}>Descrição:</Text>
                <Text style={styles.value}>{ministryData.descricao}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agenda do Mês</Text>
          <View style={styles.card}>
            {schedules.length > 0 ? (
              <View style={styles.scheduleList}>
                {schedules.map((schedule) => (
                  <View key={schedule.id} style={styles.scheduleItem}>
                    <View style={styles.scheduleContent}>
                      <View style={styles.scheduleDate}>
                        <Calendar size={16} color="#60A5FA" />
                        <Text style={styles.scheduleDateText}>
                          {new Date(schedule.date).toLocaleDateString('pt-BR')}
                        </Text>
                      </View>
                      <Text style={styles.scheduleTitle}>{schedule.title}</Text>
                      {schedule.description && (
                        <Text style={styles.scheduleDescription}>
                          {schedule.description}
                        </Text>
                      )}
                      {assignments[schedule.id]?.length > 0 && (
                        <View style={styles.assignedUsers}>
                          <Users size={14} color="#60A5FA" />
                          <Text style={styles.assignedUsersText}>
                            {assignments[schedule.id].map(a => a.nome_usuario).join(', ')}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.scheduleActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleAssignUsers(schedule)}>
                        <UserPlus size={18} color="#60A5FA" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteSchedule(schedule)}>
                        <Trash2 size={18} color="#f87171" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>Nenhuma agenda criada</Text>
            )}
            <TouchableOpacity style={styles.createButton} onPress={handleCreateSchedule}>
              <Plus size={20} color="#fff" />
              <Text style={styles.createButtonText}>Criar Agenda</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informativos</Text>
          <View style={styles.card}>
            {announcements.length > 0 ? (
              <View style={styles.announcementList}>
                {announcements.map((announcement) => (
                  <View key={announcement.id} style={styles.announcementItem}>
                    <View style={styles.announcementContent}>
                      <View style={styles.announcementHeader}>
                        <BellRing size={16} color="#60A5FA" />
                        <Text style={styles.announcementDate}>
                          {new Date(announcement.created_at).toLocaleDateString('pt-BR')}
                        </Text>
                      </View>
                      <Text style={styles.announcementTitle}>{announcement.title}</Text>
                      <Text style={styles.announcementDescription}>
                        {announcement.content}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.statusButton,
                          announcement.active ? styles.statusActive : styles.statusInactive
                        ]}
                        onPress={() => handleToggleAnnouncementStatus(announcement)}>
                        <Text style={styles.statusText}>
                          {announcement.active ? 'Ativo' : 'Inativo'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteAnnouncement(announcement)}>
                      <Trash2 size={18} color="#f87171" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>Nenhum informativo criado</Text>
            )}
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateAnnouncement(true)}>
              <Plus size={20} color="#fff" />
              <Text style={styles.createButtonText}>Criar Informativo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestão de Usuários</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Usuários Ativos</Text>
            <Text style={styles.cardValue}>{userCount}</Text>
            <TouchableOpacity 
              style={styles.createButton} 
              onPress={() => setShowCreateUser(true)}>
              <UserPlus size={20} color="#fff" />
              <Text style={styles.createButtonText}>Criar Usuário</Text>
            </TouchableOpacity>

            <View style={styles.userList}>
              {users.map((user) => (
                <View key={user.id} style={styles.userItem}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.nome_usuario}</Text>
                    <Text style={styles.userCPF}>{formatCPF(user.cpf)}</Text>
                    <Text style={[
                      styles.userStatus,
                      user.status === 'active' ? styles.statusActive : styles.statusInactive
                    ]}>
                      {user.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Text>
                  </View>
                  <View style={styles.userActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleEditUser(user)}>
                      <Pencil size={18} color="#60A5FA" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleDeleteUser(user)}>
                      <Trash2 size={18} color="#f87171" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <CreateUserModal
        visible={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        onSuccess={handleUserCreated}
        adminId={ministryData?.id}
      />

      <EditUserModal
        visible={showEditUser}
        onClose={() => {
          setShowEditUser(false);
          setSelectedUser(null);
        }}
        onSuccess={handleUserCreated}
        user={selectedUser}
      />

      <CreateScheduleModal
        visible={showCreateSchedule}
        onClose={() => setShowCreateSchedule(false)}
        onSuccess={handleScheduleCreated}
        adminId={ministryData?.id}
      />

      <AssignUsersModal
        visible={showAssignUsers}
        onClose={() => {
          setShowAssignUsers(false);
          setSelectedSchedule(null);
        }}
        onSuccess={() => {
          fetchAssignments(selectedSchedule?.id || '');
        }}
        schedule={selectedSchedule}
        adminId={ministryData?.id}
      />

      <CreateAnnouncementModal
        visible={showCreateAnnouncement}
        onClose={() => setShowCreateAnnouncement(false)}
        onSuccess={fetchAnnouncements}
        adminId={ministryData?.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loginContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  loginTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: '#fff',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#60A5FA',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontFamily: 'Inter_400Regular',
  },
  loginButton: {
    backgroundColor: '#60A5FA',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  errorText: {
    color: '#f87171',
    marginBottom: 16,
    fontFamily: 'Inter_400Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  logoutText: {
    color: '#f87171',
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  ministrySection: {
    padding: 20,
  },
  ministryCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    gap: 16,
  },
  ministryInfo: {
    gap: 4,
  },
  value: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#fff',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#666',
  },
  cardValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: '#fff',
    marginTop: 8,
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#60A5FA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 8,
  },
  userList: {
    marginTop: 20,
    gap: 12,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#262626',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  userCPF: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  userStatus: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 4,
  },
  statusActive: {
    color: '#34D399',
  },
  statusInactive: {
    color: '#f87171',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  scheduleList: {
    gap: 12,
    marginBottom: 16,
  },
  scheduleItem: {
    backgroundColor: '#262626',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleDateText: {
    color: '#60A5FA',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 8,
  },
  scheduleTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  scheduleDescription: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  scheduleActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  assignedUsers: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  assignedUsersText: {
    color: '#60A5FA',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  announcementList: {
    gap: 12,
    marginBottom: 16,
  },
  announcementItem: {
    backgroundColor: '#262626',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  announcementContent: {
    flex: 1,
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  announcementDate: {
    color: '#60A5FA',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 8,
  },
  announcementTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  announcementDescription: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
    marginBottom: 8,
  },
  statusButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchButton: {
    marginTop: 16,
    padding: 8,
  },
  switchButtonText: {
    color: '#60A5FA',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
});