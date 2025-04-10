import { View, Text } from 'react-native';
import PlayerInput from '../components/PlayerInput';
import TierSelector from '../components/TierSelector';
import { useState } from 'react';
import DraggableTierList from '../components/DraggableTierList';

export default function HomeScreen({ navigation }) {
  const [tierCount, setTierCount] = useState(null);
  const [players, setPlayers] = useState([]);

  return (
    <View className="flex-1 bg-white items-center pt-10 px-4">
      <Text className="text-2xl font-bold text-black mb-2">🏠 Team Tier Builder</Text>

      <TierSelector onSelect={setTierCount} />

      <PlayerInput onChange={setPlayers} />

        {tierCount && players.length > 0 && (
    <DraggableTierList tierCount={tierCount} players={players} />
    )}
    </View>
  );
}
