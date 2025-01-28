import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { TimerProvider } from './src/context/TimerContext';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

// Configure notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
    });

    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
    });

    return () => {
      foregroundSubscription.remove();
      backgroundSubscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <TimerProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </TimerProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  }
});
