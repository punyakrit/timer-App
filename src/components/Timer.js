import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal } from 'react-native';
import { useTimer } from '../context/TimerContext';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Timer({ timer }) {
  const { dispatch } = useTimer();
  const intervalRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showHalfwayAlert, setShowHalfwayAlert] = useState(false);
  const [hasShownHalfwayAlert, setHasShownHalfwayAlert] = useState(false);

  useEffect(() => {
    progressAnim.setValue(timer.remainingTime / timer.duration);
  }, [timer.remainingTime, timer.duration]);

  const updateTimer = useCallback(() => {
    if (timer.remainingTime > 0) {
      dispatch({
        type: 'UPDATE_TIMER',
        payload: {
          ...timer,
          remainingTime: timer.remainingTime - 1,
        },
      });

      Animated.timing(progressAnim, {
        toValue: (timer.remainingTime - 1) / timer.duration,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [timer, dispatch]);

  useEffect(() => {
    if (timer.status === 'running' && timer.remainingTime > 0) {
      intervalRef.current = setInterval(updateTimer, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timer.status, updateTimer]);

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    })();
  }, []);

  const showNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Timer Completed! 🎉',
        body: `${timer.name} has finished!`,
        data: { timerData: timer },
        sound: true, 
      },
      trigger: null, 
    });
  };


  useEffect(() => {

    const halfwayPoint = Math.floor(timer.duration / 2);
    if (
      timer.status === 'running' &&
      timer.remainingTime === halfwayPoint &&
      !hasShownHalfwayAlert &&
      timer.enableHalfwayAlert
    ) {
      setShowHalfwayAlert(true);
      setHasShownHalfwayAlert(true);
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Halfway There! ⏰',
          body: `${timer.name} is at 50%!`,
          data: { timerData: timer },
        },
        trigger: null,
      });
    }

    if (timer.remainingTime === 0 && timer.status === 'running') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      dispatch({
        type: 'UPDATE_TIMER',
        payload: { ...timer, status: 'completed' },
      });
      dispatch({
        type: 'ADD_TO_HISTORY',
        payload: {
          ...timer,
          completedAt: new Date().toISOString(),
        },
      });
      setShowCompletionModal(true);
      showNotification(); 
    }
  }, [timer.remainingTime, timer.status]);

  const toggleTimer = useCallback(() => {
    if (timer.status === 'completed') return;
    
    dispatch({
      type: 'UPDATE_TIMER',
      payload: {
        ...timer,
        status: timer.status === 'running' ? 'paused' : 'running',
      },
    });
  }, [timer, dispatch]);

  const resetTimer = useCallback(() => {
    if (timer.status === 'completed') return;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setHasShownHalfwayAlert(false);
    dispatch({
      type: 'UPDATE_TIMER',
      payload: {
        ...timer,
        remainingTime: timer.duration,
        status: 'paused',
      },
    });
    progressAnim.setValue(1);
  }, [timer, dispatch]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[
      styles.container,
      timer.status === 'completed' && styles.completedContainer
    ]}>
      <View style={styles.timerInfo}>
        <Text style={styles.name}>{timer.name}</Text>
        <Text style={[styles.status, styles[timer.status]]}>
          {timer.status.toUpperCase()}
        </Text>
      </View>
      
      <Text style={styles.time}>
        {Math.floor(timer.remainingTime / 60)}:
        {(timer.remainingTime % 60).toString().padStart(2, '0')}
      </Text>

      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressWidth,
              backgroundColor:
                timer.status === 'completed' ? '#4CAF50' : '#007AFF',
            },
          ]}
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.button,
            timer.status === 'completed' && styles.disabledButton
          ]}
          onPress={toggleTimer}
          disabled={timer.status === 'completed'}
        >
          <Text style={styles.buttonText}>
            {timer.status === 'running' ? 'Pause' : 'Start'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            timer.status === 'completed' && styles.disabledButton
          ]}
          onPress={resetTimer}
          disabled={timer.status === 'completed'}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showCompletionModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Congratulations! 🎉</Text>
            <Text style={styles.modalText}>
              {timer.name} has been completed!
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowCompletionModal(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showHalfwayAlert}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Halfway There! ⏰</Text>
            <Text style={styles.modalText}>
              {timer.name} is at 50%!
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowHalfwayAlert(false)}
            >
              <Text style={styles.modalButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  timerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 18,
    fontFamily: 'monospace',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  running: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  paused: {
    backgroundColor: '#FFC107',
    color: 'black',
  },
  completed: {
    backgroundColor: '#9E9E9E',
    color: 'white',
  },
  completedContainer: {
    opacity: 0.7,
    backgroundColor: '#f5f5f5',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
}); 