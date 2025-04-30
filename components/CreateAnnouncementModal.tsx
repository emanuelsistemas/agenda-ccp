import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface CreateAnnouncementModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  adminId: string;
}

export function CreateAnnouncementModal({ visible, onClose, onSuccess, adminId }: CreateAnnouncementModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setError('');
      setIsLoading(true);

      if (!title.trim()) {
        setError('Título é obrigatório');
        return;
      }

      if (!content.trim()) {
        setError('Conteúdo é obrigatório');
        return;
      }

      if (title.length > 100) {
        setError('Título deve ter no máximo 100 caracteres');
        return;
      }

      const { error: insertError } = await supabase
        .from('announcements')
        .insert([
          {
            admin_id: adminId,
            title: title.trim(),
            content: content.trim(),
          }
        ]);

      if (insertError) throw insertError;

      onSuccess();
      onClose();
      setTitle('');
      setContent('');
    } catch (err) {
      console.error('Error creating announcement:', err);
      setError('Erro ao criar informativo');
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
            <Text style={styles.title}>Criar Informativo</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <ScrollView>
            <Text style={styles.label}>Título</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Digite o título do informativo"
              placeholderTextColor="#666"
              maxLength={100}
            />

            <Text style={styles.label}>Conteúdo</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={content}
              onChangeText={setContent}
              placeholder="Digite o conteúdo do informativo"
              placeholderTextColor="#666"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}>
              <Text style={styles.buttonText}>
                {isLoading ? 'Criando...' : 'Criar Informativo'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
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
  textArea: {
    height: 120,
    textAlignVertical: 'top',
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