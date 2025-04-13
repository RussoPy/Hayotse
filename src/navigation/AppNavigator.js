import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebaseConfig';

// Screens
import AuthScreen from '../screens/AuthScreen';
import PlayerSetupScreen from '../screens/PlayerSetupScreen';
import TierListScreen from '../screens/TierListScreen';
import TeamSetupScreen from '../screens/TeamSetupScreen';
import TeamResultsScreen from '../screens/TeamResultsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);

  if (initializing) return null; // or splash screen

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="PlayerSetup" component={PlayerSetupScreen} />
            <Stack.Screen name="TierList" component={TierListScreen} />
            <Stack.Screen name="TeamSetup" component={TeamSetupScreen} />
            <Stack.Screen name="TeamResults" component={TeamResultsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
