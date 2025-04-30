import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Switch } from 'react-native';
import { X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  nome_usuario: string;
  cpf: string;
  status: 'active' | 'inactive';
}

interface EditUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
}

export function EditUserModal({ visible, onClose, onSuccess, user }: EditUserModalProps) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setNome(user.nome_usuario);
      setCpf(formatCPF(user.cpf));
      setIsActive(user.status === 'active');
    }
  }, [user]);

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
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setIsLoading(true);

      if (!nome.trim()) {
        setError('Nome é obrigatório');
        return;
      }

      const cleanCPF = cpf.replace(/\D/g, '');
      if (!validateCPF(cleanCPF)) {
        setError('CPF inválido');
        return;
      }

      if (!user?.id) {
        setError('Usuário inválido');
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles_user')
        .update({
          nome_usuario: nome.trim(),
          cpf: cleanCPF,
          status: isActive ? 'active' : 'inactive'
        })
        .eq('id', user.id);

      if (updateError) {
        if (updateError.code === '23505') {
          setError('CPF já cadastrado');
        } else {
          setError('Erro ao atualizar usuário');
        }
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError('Erro ao atualizar usuário');
      console.error('Error updating user:', err);
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
            <Text style={styles.title}>Editar Usuário</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.label}>Nome do Usuário</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Digite o nome completo"
            placeholderTextColor="#666"
          />

          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={styles.input}
            value={cpf}
            onChangeText={handleCPFChange}
            placeholder="000.000.000-00"
            placeholderTextColor="#666"
            keyboardType="numeric"
            maxLength={14}
          />

          <View style={styles.statusContainer}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.switchContainer}>
              <Text style={[styles.statusText, !isActive && styles.statusTextInactive]}>
                {isActive ? 'Ativo' : 'Inativo'}
              </Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: '#333', true: '#60A5FA' }}
                thumbColor={isActive ? '#fff' : '#666'}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}>
            <Text style={styles.buttonText}>
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
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
  label: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontFamily: 'Inter_400Regular',
  },
  statusContainer: {
    marginTop: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
  },
  statusText: {
    color: '#60A5FA',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  statusTextInactive: {
    color: '#666',
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