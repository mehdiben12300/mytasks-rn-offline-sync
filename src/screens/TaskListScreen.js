import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext';
import TaskCard from '../components/TaskCard';
import StatsOverview from '../components/StatsOverview';

export const TaskListScreen = ({ navigation }) => {
  const { tasks, loading, syncStatus, pendingCount, triggerSync, stats } = useTasks();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Toutes');

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Filtre statut : gère 'Toutes', 'À faire', et 'Terminées' (avec ou sans 's')
      let matchesFilter = true;
      if (activeFilter === 'À faire') {
        matchesFilter = task.status === 'À faire';
      } else if (activeFilter === 'Terminées') {
        matchesFilter = task.status === 'Terminée' || task.status === 'Terminées';
      }

      // Filtre recherche
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesFilter && matchesSearch;
    });
  }, [tasks, activeFilter, searchQuery]);

  // Écran de chargement initial
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={styles.loadingText}>Chargement de vos tâches...</Text>
      </View>
    );
  }

  // Rendu du badge de synchronisation
  const renderSyncBadge = () => {
    if (syncStatus === 'syncing') {
      return (
        <TouchableOpacity style={[styles.syncBadge, styles.syncingBadge]} onPress={triggerSync}>
          <ActivityIndicator size="small" color="#0284C7" style={{ transform: [{ scale: 0.7 }] }} />
          <Text style={[styles.syncBadgeText, { color: '#0284C7' }]}>Sync...</Text>
        </TouchableOpacity>
      );
    }
    if (syncStatus === 'offline') {
      return (
        <TouchableOpacity style={[styles.syncBadge, styles.offlineBadge]} onPress={triggerSync}>
          <Ionicons name="cloud-offline" size={13} color="#D97706" />
          <Text style={[styles.syncBadgeText, { color: '#D97706' }]}>
            Hors-ligne {pendingCount > 0 ? `(${pendingCount})` : ''}
          </Text>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity style={[styles.syncBadge, styles.syncedBadge]} onPress={triggerSync}>
        <Ionicons name="cloud-done" size={13} color="#16A34A" />
        <Text style={[styles.syncBadgeText, { color: '#16A34A' }]}>Synchronisé</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {/* En-tête : Titre + Badge Sync + Bouton Ajouter (+) */}
        <View style={styles.header}>
          <View style={styles.titleWithBadge}>
            <Text style={styles.headerTitle}>Mes tâches</Text>
            {renderSyncBadge()}
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('TaskForm', { mode: 'add' })}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Statistiques */}
        <StatsOverview stats={stats} />

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une tâche..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtres par onglets */}
        <View style={styles.filterTabs}>
          {['Toutes', 'À faire', 'Terminées'].map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.filterTabText, isActive && styles.filterTabTextActive]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Liste des tâches avec FlatList et Pull-to-refresh (synchronisation) */}
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={syncStatus === 'syncing'}
              onRefresh={triggerSync}
              colors={['#0284C7']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>Aucune tâche trouvée</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  syncedBadge: {
    backgroundColor: '#DCFCE7',
  },
  offlineBadge: {
    backgroundColor: '#FEF3C7',
  },
  syncingBadge: {
    backgroundColor: '#E0F2FE',
  },
  syncBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: '#0284C7',
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    padding: 0,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#0284C7',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94A3B8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
});

export default TaskListScreen;
