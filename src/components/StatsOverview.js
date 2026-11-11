import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const StatsOverview = ({ stats }) => {
  return (
    <View style={styles.container}>
      {/* Total */}
      <View style={[styles.statCard, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
        <Text style={[styles.statLabel, { color: '#2563EB' }]}>Total</Text>
        <Text style={[styles.statValue, { color: '#1D4ED8' }]}>{stats.total}</Text>
      </View>

      {/* Terminées */}
      <View style={[styles.statCard, { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }]}>
        <Text style={[styles.statLabel, { color: '#16A34A' }]}>Terminées</Text>
        <Text style={[styles.statValue, { color: '#15803D' }]}>{stats.completed}</Text>
      </View>

      {/* À faire */}
      <View style={[styles.statCard, { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' }]}>
        <Text style={[styles.statLabel, { color: '#D97706' }]}>À faire</Text>
        <Text style={[styles.statValue, { color: '#B45309' }]}>{stats.pending}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 14,
  },
  statCard: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
});

export default StatsOverview;
