import { useEffect } from 'react';
import { I18nManager, View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { useFonts } from 'expo-font';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Helvetica': require('./assets/fonts/Helvetica.ttf'),
    'Helvetica-Bold': require('./assets/fonts/Helvetica-Bold.ttf'),
  });

  useEffect(() => {
    // Force LTR layout
    I18nManager.allowRTL(false);
    I18nManager.forceRTL(false);
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#18181b' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor="#18181b" />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}