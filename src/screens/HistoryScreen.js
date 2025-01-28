import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTimer } from '../context/TimerContext';

export default function HistoryScreen() {
  const { state } = useTimer();

  const renderHistoryItem = ({ item }) => {
    const completedDate = new Date(item.completedAt);
    return (
      <View style={styles.historyItem}>
        <View style={styles.historyHeader}>
          <Text style={styles.timerName}>{item.name}</Text>
          <Text style={styles.category}>{item.category}</Text>
        </View>
        <Text style={styles.completedAt}>
          Completed: {completedDate.toLocaleDateString()}{' '}
          {completedDate.toLocaleTimeString()}
        </Text>
        <Text style={styles.duration}>Duration: {item.duration} seconds</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={state.history.sort(
          (a, b) => new Date(b.completedAt) - new Date(a.completedAt)
        )}
        renderItem={renderHistoryItem}
        keyExtractor={item => item.id + item.completedAt}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No completed timers yet</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  historyItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  timerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  category: {
    fontSize: 14,
    color: '#666',
  },
  completedAt: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  duration: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
}); 