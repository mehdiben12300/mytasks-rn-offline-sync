import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext';
import { getApiUrl, setApiUrl } from '../config/api';

const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export const ProfileScreen = () => {
  const { stats, syncStatus, lastSyncTime, pendingCount, triggerSync } = useTasks();
  const [apiUrlInput, setApiUrlInput] = useState(getApiUrl());
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  const handleSaveApiUrl = () => {
    if (!apiUrlInput.trim()) {
      showAlert('Erreur', "L'URL de l'API ne peut pas être vide.");
      return;
    }
    setApiUrl(apiUrlInput.trim());
    showAlert('Succès', "Nouvelle adresse d'API enregistrée !");
    triggerSync();
  };

  const handleForceSync = async () => {
    setIsManualSyncing(true);
    const ok = await triggerSync();
    setIsManualSyncing(false);
    if (ok) {
      showAlert('Succès', 'Synchronisation avec le serveur réussie !');
    } else {
      showAlert(
        'Hors-ligne',
        `Impossible de joindre le serveur (${getApiUrl()}). Vérifiez que le backend est démarré.`
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar et Nom */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="sync-circle" size={48} color="#0284C7" />
          </View>
          <Text style={styles.userName}>Mon Espace</Text>
          <Text style={styles.userRole}>Étudiant / Développeur Mobile</Text>
        </View>

        {/* Carte Mode de stockage */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Ionicons name="git-compare-outline" size={22} color="#0284C7" />
            <Text style={styles.infoCardTitle}>Mode de stockage</Text>
          </View>
          <View style={styles.badgeMode}>
            <Text style={styles.badgeModeText}>Projet 3 : Local + Synchronisation (Offline-First)</Text>
          </View>
          <Text style={styles.infoCardDesc}>
            Sauvegarde locale immédiate dans <Text style={{ fontWeight: '700' }}>AsyncStorage</Text> (zéro latence) combinée à une synchronisation automatique en arrière-plan avec l'API REST.
          </Text>
        </View>

        {/* État de la synchronisation */}
        <View style={styles.syncCard}>
          <Text style={styles.syncCardTitle}>État de la Synchronisation</Text>

          <View style={styles.syncRow}>
            <Text style={styles.syncLabel}>Statut réseau :</Text>
            <Text
              style={[
                styles.syncValue,
                { color: syncStatus === 'offline' ? '#D97706' : '#16A34A' },
              ]}
            >
              {syncStatus === 'offline' ? '🟠 Hors-ligne' : syncStatus === 'syncing' ? '🔄 Synchronisation...' : '🟢 En ligne'}
            </Text>
          </View>

          <View style={styles.syncRow}>
            <Text style={styles.syncLabel}>Dernière synchronisation :</Text>
            <Text style={styles.syncValue}>{lastSyncTime || 'Pas encore synchronisé'}</Text>
          </View>

          <View style={styles.syncRow}>
            <Text style={styles.syncLabel}>Modifications en attente :</Text>
            <Text style={[styles.syncValue, pendingCount > 0 && { color: '#D97706', fontWeight: '800' }]}>
              {pendingCount} action(s)
            </Text>
          </View>

          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleForceSync}
            activeOpacity={0.8}
            disabled={isManualSyncing}
          >
            {isManualSyncing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
                <Text style={styles.syncButtonText}>Forcer la synchronisation</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Configuration de l'URL API */}
        <View style={styles.configCard}>
          <Text style={styles.configCardTitle}>Configuration Serveur API</Text>
          <Text style={styles.configCardSub}>
            Adresse IP du serveur sur votre réseau :
          </Text>
          <TextInput
            style={styles.apiInput}
            value={apiUrlInput}
            onChangeText={setApiUrlInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.saveUrlBtn}
            onPress={handleSaveApiUrl}
            activeOpacity={0.8}
          >
            <Text style={styles.saveUrlBtnText}>Appliquer la nouvelle adresse</Text>
          </TouchableOpacity>
        </View>

        {/* Statistiques rapides */}
        <View style={styles.statsCard}>
          <Text style={styles.statsCardTitle}>Tâches stockées</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#10B981' }]}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Terminées</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{stats.pending}</Text>
              <Text style={styles.statLabel}>À faire</Text>
            </View>
          </View>
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
  container: {
    padding: 20,
    backgroundColor: '#F8FAFC',
    flexGrow: 1,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  userRole: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  badgeMode: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginVertical: 6,
  },
  badgeModeText: {
    color: '#0284C7',
    fontWeight: '700',
    fontSize: 12,
  },
  infoCardDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 4,
  },
  syncCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  syncCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  syncLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  syncValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  configCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  configCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  configCardSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  apiInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 10,
  },
  saveUrlBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveUrlBtnText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 13,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  statsCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
});

export default ProfileScreen;
