import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext';

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Élevée':
      return { bg: '#FEE2E2', text: '#DC2626' };
    case 'Moyenne':
      return { bg: '#FEF3C7', text: '#D97706' };
    case 'Faible':
    default:
      return { bg: '#DCFCE7', text: '#16A34A' };
  }
};

const getStatusColor = (status) => {
  if (status === 'Terminée' || status === 'Terminées') {
    return { bg: '#DCFCE7', text: '#16A34A' };
  }
  return { bg: '#E0F2FE', text: '#0284C7' };
};

export const TaskDetailScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const { getTask, deleteTask } = useTasks();

  const task = getTask(taskId);

  if (!task) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Tâche introuvable.</Text>
          <TouchableOpacity
            style={styles.backButtonSimple}
            onPress={() => navigation.navigate('MainTabs', { screen: 'TasksTab' })}
          >
            <Text style={styles.backButtonSimpleText}>Retour à la liste</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const priorityColor = getPriorityColor(task.priority);
  const statusColor = getStatusColor(task.status);

  const performDelete = async () => {
    await deleteTask(task.id);
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
        'Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.',
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

      {/* Barre supérieure personnalisée */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
          <Text style={styles.topBarTitle}>Détails d'une tâche</Text>
        </TouchableOpacity>
        <Ionicons name="ellipsis-vertical" size={20} color="#64748B" />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Carte principale des informations de la tâche */}
        <View style={styles.detailCard}>
          <Text style={styles.taskTitle}>{task.title}</Text>

          {/* Badges */}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: priorityColor.bg }]}>
              <Text style={[styles.badgeText, { color: priorityColor.text }]}>
                {task.priority}
              </Text>
            </View>

            <View style={[styles.badge, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.badgeText, { color: statusColor.text }]}>
                {task.status}
              </Text>
            </View>
          </View>

          {/* Description */}
          {task.description ? (
            <Text style={styles.taskDescription}>{task.description}</Text>
          ) : null}

          {/* Date de création */}
          <View style={styles.dateBlock}>
            <Ionicons name="calendar-outline" size={16} color="#64748B" />
            <View>
              <Text style={styles.dateLabel}>Date de création</Text>
              <Text style={styles.dateValue}>{task.createdAt}</Text>
            </View>
          </View>
        </View>

        {/* Boutons d'actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => navigation.navigate('TaskForm', { mode: 'edit', taskId: task.id })}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={18} color="#FFFFFF" style={styles.btnIcon} />
            <Text style={styles.editBtnText}>Modifier</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" style={styles.btnIcon} />
            <Text style={styles.deleteBtnText}>Supprimer</Text>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
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
    backgroundColor: '#F8FAFC',
    flexGrow: 1,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    marginTop: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  taskDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 20,
  },
  dateBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  dateLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  actionsContainer: {
    marginTop: 24,
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  editBtn: {
    backgroundColor: '#0284C7',
  },
  editBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#EF4444',
  },
  deleteBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  btnIcon: {
    marginRight: 8,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 12,
  },
  backButtonSimple: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonSimpleText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default TaskDetailScreen;
