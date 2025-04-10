import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PlayerSetupScreen from '../screens/PlayerSetupScreen';
import TierListScreen from '../screens/TierListScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="PlayerSetup" component={PlayerSetupScreen} />
        <Stack.Screen name="TierList" component={TierListScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
