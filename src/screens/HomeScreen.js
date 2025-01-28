import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useTimer } from '../context/TimerContext';
import Timer from '../components/Timer';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { state, dispatch } = useTimer();
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showCompleted, setShowCompleted] = useState(false);

  const groupedTimers = state.timers.reduce((groups, timer) => {
    if (timer.status === 'completed' && !showCompleted) return groups;
    
    if (!groups[timer.category]) {
      groups[timer.category] = [];
    }
    groups[timer.category].push(timer);
    return groups;
  }, {});

  const handleCategoryAction = (category, action) => {
    const categoryTimers = state.timers.filter(
      timer => timer.category === category && timer.status !== 'completed'
    );
    
    categoryTimers.forEach(timer => {
      let updatedTimer = { ...timer };
      switch (action) {
        case 'start':
          updatedTimer.status = 'running';
          break;
        case 'pause':
          if (timer.status === 'running') {
            updatedTimer.status = 'paused';
          }
          break;
        case 'reset':
          updatedTimer.status = 'paused';
          updatedTimer.remainingTime = timer.duration;
          break;
      }
      dispatch({ type: 'UPDATE_TIMER', payload: updatedTimer });
    });
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Timers</Text>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowCompleted(!showCompleted)}
        >
          <Ionicons 
            name={showCompleted ? 'eye-off' : 'eye'} 
            size={20} 
            color="#fff" 
          />
          <Text style={styles.toggleButtonText}>
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {Object.entries(groupedTimers).map(([category, timers]) => (
          timers.length > 0 && (
            <View key={category} style={styles.categoryContainer}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => toggleCategory(category)}
              >
                <View style={styles.categoryTitleContainer}>
                  <Ionicons
                    name={expandedCategories[category] ? 'chevron-down' : 'chevron-forward'}
                    size={24}
                    color="#007AFF"
                  />
                  <Text style={styles.categoryTitle}>{category}</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>
                      {timers.length}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {expandedCategories[category] && (
                <View style={styles.categoryContent}>
                  <View style={styles.categoryControls}>
                    <TouchableOpacity
                      style={[styles.categoryButton, styles.startButton]}
                      onPress={() => handleCategoryAction(category, 'start')}
                    >
                      <Ionicons name="play" size={18} color="#fff" />
                      <Text style={styles.categoryButtonText}>Start All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.categoryButton, styles.pauseButton]}
                      onPress={() => handleCategoryAction(category, 'pause')}
                    >
                      <Ionicons name="pause" size={18} color="#fff" />
                      <Text style={styles.categoryButtonText}>Pause All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.categoryButton, styles.resetButton]}
                      onPress={() => handleCategoryAction(category, 'reset')}
                    >
                      <Ionicons name="refresh" size={18} color="#fff" />
                      <Text style={styles.categoryButtonText}>Reset All</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {timers.map(timer => (
                    <Timer key={timer.id} timer={timer} />
                  ))}
                </View>
              )}
            </View>
          )
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
  },
  categoryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryHeader: {
    padding: 15,
    backgroundColor: '#fff',
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryContent: {
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  categoryControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  pauseButton: {
    backgroundColor: '#FFC107',
  },
  resetButton: {
    backgroundColor: '#9E9E9E',
  },
  categoryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
}); 