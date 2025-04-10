import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TeamSetupScreen from '../screens/TeamSetupScreen';
import PlayerSetupScreen from '../screens/PlayerSetupScreen';
import TierListScreen from '../screens/TierListScreen';
import TeamResultsScreen from '../screens/TeamResultsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="PlayerSetup" component={PlayerSetupScreen} />
        <Stack.Screen name="TierList" component={TierListScreen} />
        <Stack.Screen name="TeamSetup" component={TeamSetupScreen} />
        <Stack.Screen name="TeamResults" component={TeamResultsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
