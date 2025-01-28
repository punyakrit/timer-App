import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TimerContext = createContext();

const initialState = {
  timers: [],
  history: [],
  categories: ['Workout', 'Study', 'Break', 'Other'],
};

function timerReducer(state, action) {
  switch (action.type) {
    case 'ADD_TIMER':
      return {
        ...state,
        timers: [...state.timers, action.payload],
      };
    case 'UPDATE_TIMER':
      return {
        ...state,
        timers: state.timers.map(timer =>
          timer.id === action.payload.id ? action.payload : timer
        ),
      };
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        history: [...state.history, action.payload],
      };
    case 'LOAD_STATE':
      return action.payload;
    case 'UPDATE_MULTIPLE_TIMERS':
      return {
        ...state,
        timers: state.timers.map(timer =>
          action.payload.ids.includes(timer.id) ? 
            { ...timer, ...action.payload.updates } : 
            timer
        ),
      };
    case 'DELETE_TIMER':
      return {
        ...state,
        timers: state.timers.filter(timer => timer.id !== action.payload),
      };
    default:
      return state;
  }
}

export function TimerProvider({ children }) {
  const [state, dispatch] = useReducer(timerReducer, initialState);

  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    saveState();
  }, [state]);

  const loadState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('timerState');
      if (savedState) {
        dispatch({ type: 'LOAD_STATE', payload: JSON.parse(savedState) });
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }
  };

  const saveState = async () => {
    try {
      await AsyncStorage.setItem('timerState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  };

  return (
    <TimerContext.Provider value={{ state, dispatch }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  return useContext(TimerContext);
} 