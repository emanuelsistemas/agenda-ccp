import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  nome_usuario: string;
  status: 'active' | 'inactive';
}

interface Schedule {
  id: string;
  date: string;
  title: string;
}

interface AssignUsersModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schedule: Schedule | null;
  adminId: string;
}

export function AssignUsersModal({ visible, onClose, onSuccess, schedule, adminId }: AssignUsersModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && schedule) {
      fetchUsers();
      fetchExistingAssignments();
    }
  }, [visible, schedule]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles_user')
        .select('*')
        .eq('admin_id', adminId)
        .eq('status', 'active')
        .order('nome_usuario');

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Erro ao carregar usuários');
    }
  };

  const fetchExistingAssignments = async () => {
    if (!schedule) return;

    try {
      const { data, error } = await supabase
        .from('schedule_assignments')
        .select('user_id')
        .eq('schedule_id', schedule.id);

      if (error) throw error;
      setSelectedUsers(data?.map(assignment => assignment.user_id) || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const handleSave = async () => {
    if (!schedule) return;

    try {
      setError('');
      setIsLoading(true);

      // Remove existing assignments
      const { error: deleteError } = await supabase
        .from('schedule_assignments')
        .delete()
        .eq('schedule_id', schedule.id);

      if (deleteError) throw deleteError;

      // Add new assignments
      if (selectedUsers.length > 0) {
        const { error: insertError } = await supabase
          .from('schedule_assignments')
          .insert(
            selectedUsers.map(userId => ({
              schedule_id: schedule.id,
              user_id: userId
            }))
          );

        if (insertError) throw insertError;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving assignments:', err);
      setError('Erro ao salvar escalas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Escalar Usuários</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {schedule && (
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleDate}>
                {new Date(schedule.date).toLocaleDateString('pt-BR')}
              </Text>
              <Text style={styles.scheduleTitle}>{schedule.title}</Text>
            </View>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <ScrollView style={styles.userList}>
            {users.map(user => (
              <TouchableOpacity
                key={user.id}
                style={[
                  styles.userItem,
                  selectedUsers.includes(user.id) && styles.userItemSelected
                ]}
                onPress={() => toggleUser(user.id)}>
                <Text style={[
                  styles.userName,
                  selectedUsers.includes(user.id) && styles.userNameSelected
                ]}>
                  {user.nome_usuario}
                </Text>
                {selectedUsers.includes(user.id) && (
                  <Check size={20} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isLoading}>
            <Text style={styles.buttonText}>
              {isLoading ? 'Salvando...' : 'Salvar Escala'}
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
    maxHeight: '80%',
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
  scheduleInfo: {
    backgroundColor: '#262626',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  scheduleDate: {
    color: '#60A5FA',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  scheduleTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 4,
  },
  userList: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#262626',
    borderRadius: 8,
    marginBottom: 8,
  },
  userItemSelected: {
    backgroundColor: '#60A5FA',
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  userNameSelected: {
    fontFamily: 'Inter_600SemiBold',
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
});