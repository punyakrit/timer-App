import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { useTimer } from '../context/TimerContext';

export default function AddTimerScreen({ navigation }) {
  const { state, dispatch } = useTimer();
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState(state.categories[0]);
  const [enableHalfwayAlert, setEnableHalfwayAlert] = useState(false);

  const handleSubmit = () => {
    if (!name || !duration) return;

    const newTimer = {
      id: Date.now().toString(),
      name,
      duration: parseInt(duration),
      category,
      remainingTime: parseInt(duration),
      status: 'paused',
      createdAt: new Date().toISOString(),
      enableHalfwayAlert,
    };

    dispatch({ type: 'ADD_TIMER', payload: newTimer });
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Timer Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter timer name"
      />

      <Text style={styles.label}>Duration (seconds)</Text>
      <TextInput
        style={styles.input}
        value={duration}
        onChangeText={setDuration}
        placeholder="Enter duration in seconds"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Category</Text>
      <Picker
        selectedValue={category}
        onValueChange={setCategory}
        style={styles.picker}
      >
        {state.categories.map(cat => (
          <Picker.Item key={cat} label={cat} value={cat} />
        ))}
      </Picker>

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Enable Halfway Alert</Text>
        <Switch
          value={enableHalfwayAlert}
          onValueChange={setEnableHalfwayAlert}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Create Timer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 