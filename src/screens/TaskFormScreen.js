import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext';

export const TaskFormScreen = ({ route, navigation }) => {
  const { mode = 'add', taskId } = route.params || {};
  const isEditing = mode === 'edit';

  const { addTask, updateTask, deleteTask, getTask } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Moyenne'); // 'Faible' | 'Moyenne' | 'Élevée'
  const [status, setStatus] = useState('À faire'); // 'À faire' | 'Terminée'

  useEffect(() => {
    if (isEditing && taskId) {
      const existing = getTask(taskId);
      if (existing) {
        setTitle(existing.title);
        setDescription(existing.description || '');
        setPriority(existing.priority || 'Moyenne');
        const normStatus =
          existing.status === 'Terminée' || existing.status === 'Terminées'
            ? 'Terminée'
            : 'À faire';
        setStatus(normStatus);
      }
    }
  }, [isEditing, taskId]);

  const handleSave = async () => {
    if (!title.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Le titre de la tâche est obligatoire.');
      } else {
        Alert.alert('Erreur', 'Le titre de la tâche est obligatoire.');
      }
      return;
    }

    if (isEditing) {
      await updateTask(taskId, {
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
      });
    } else {
      await addTask({
        title: title.trim(),
        description: description.trim(),
        priority,
      });
    }

    navigation.navigate('MainTabs', { screen: 'TasksTab' });
  };

  const performDelete = async () => {
    await deleteTask(taskId);
    navigation.navigate('MainTabs', { screen: 'TasksTab' });
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?');
      if (confirmed) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Supprimer la tâche',
        'Êtes-vous sûr de vouloir supprimer cette tâche ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: performDelete,
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Barre supérieure */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
          <Text style={styles.topBarTitle}>
            {isEditing ? 'Modifier une tâche' : 'Ajouter une tâche'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Champ Titre */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Titre *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Préparer la présentation"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Champ Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Détails de la tâche..."
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Champ Priorité */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Priorité</Text>
          <View style={styles.priorityRow}>
            {[
              { label: 'Faible', activeBg: '#DCFCE7', activeText: '#16A34A', border: '#10B981' },
              { label: 'Moyenne', activeBg: '#FEF3C7', activeText: '#D97706', border: '#F59E0B' },
              { label: 'Élevée', activeBg: '#FEE2E2', activeText: '#DC2626', border: '#EF4444' },
            ].map((p) => {
              const isSelected = priority === p.label;
              return (
                <TouchableOpacity
                  key={p.label}
                  style={[
                    styles.priorityBtn,
                    isSelected && {
                      backgroundColor: p.activeBg,
                      borderColor: p.border,
                      borderWidth: 1.5,
                    },
                  ]}
                  onPress={() => setPriority(p.label)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.priorityBtnText,
                      isSelected && { color: p.activeText, fontWeight: '700' },
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Champ Statut (visible en mode modification) */}
        {isEditing && (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Statut</Text>
            <View style={styles.statusRow}>
              <TouchableOpacity
                style={[
                  styles.statusBtn,
                  status === 'À faire' && styles.statusBtnPendingActive,
                ]}
                onPress={() => setStatus('À faire')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.statusBtnText,
                    status === 'À faire' && styles.statusBtnPendingTextActive,
                  ]}
                >
                  À faire
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusBtn,
                  (status === 'Terminée' || status === 'Terminées') && styles.statusBtnDoneActive,
                ]}
                onPress={() => setStatus('Terminée')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.statusBtnText,
                    (status === 'Terminée' || status === 'Terminées') && styles.statusBtnDoneTextActive,
                  ]}
                >
                  Terminée
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Boutons d'action */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>Enregistrer</Text>
          </TouchableOpacity>

          {isEditing && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteBtnText}>Supprimer</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    flexGrow: 1,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  textArea: {
    height: 100,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  priorityBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  statusBtnPendingActive: {
    backgroundColor: '#0284C7',
  },
  statusBtnPendingTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statusBtnDoneActive: {
    backgroundColor: '#10B981',
  },
  statusBtnDoneTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statusBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  actionsContainer: {
    marginTop: 20,
    gap: 12,
  },
  saveBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default TaskFormScreen;
