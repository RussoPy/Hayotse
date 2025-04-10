import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';

const COLORS = [
  'bg-red-200',
  'bg-blue-200',
  'bg-green-200',
  'bg-yellow-200',
  'bg-purple-200',
  'bg-pink-200',
  'bg-orange-200',
  'bg-teal-200',
  'bg-lime-200',
  'bg-amber-200',
];

export default function DraggableTierList({ tierCount, players }) {
  const [unassigned, setUnassigned] = useState([]);
  const [tieredPlayers, setTieredPlayers] = useState([]);

  useEffect(() => {
    const colored = players.map((p, i) => ({
      ...p,
      color: COLORS[i % COLORS.length],
      key: p.id.toString(),
    }));
    setUnassigned(colored);
    setTieredPlayers(Array.from({ length: tierCount }, () => []));
  }, [players, tierCount]);

  const assignToTier = (player, tierIndex) => {
    setTieredPlayers(prev => {
      const newTiers = [...prev];
      newTiers[tierIndex] = [...newTiers[tierIndex], player];
      return newTiers;
    });
    setUnassigned(prev => prev.filter(p => p.key !== player.key));
  };

  const handlePlayerTap = (player) => {
    Alert.alert(
      "Move Player",
      `Move ${player.name} to which tier?`,
      Array.from({ length: tierCount }, (_, i) => ({
        text: `Tier ${tierCount - i}`,
        onPress: () => assignToTier(player, i),
      }))
    );
  };

  const renderBadge = ({ item, drag, isActive }) => (
  <TouchableOpacity
    onLongPress={drag}
    delayLongPress={150}
    activeOpacity={0.8}
    className={`px-3 py-1 rounded-full ${item.color} shadow self-start flex-row items-center gap-2`}
  >
    <Text className="text-black font-medium">{item.name}</Text>
    <TouchableOpacity
      onPress={() => handlePlayerTap(item)}
      className="px-1 py-0.5 bg-black rounded-full"
    >
      <Text className="text-white text-xs">➕</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

  return (
    <ScrollView className="w-full mt-4 space-y-6 px-4">
      {/* Player Pool */}
      <View className="items-center">
        <Text className="text-base text-gray-700 font-semibold mb-2">Player Pool</Text>
        <View className="w-full bg-gray-100 p-3 rounded-xl border border-gray-300 min-h-[70px]">
          <DraggableFlatList
            data={unassigned}
            keyExtractor={(item) => item.key}
            onDragEnd={({ data }) => setUnassigned(data)}
            renderItem={renderBadge}
            horizontal
            contentContainerStyle={{ gap: 10 }}
          />
        </View>
      </View>

      {/* Tiers Table */}
      <View className="w-full space-y-2 pb-32">
        {tieredPlayers.map((tier, i) => {
          const displayTier = tierCount - i;
          return (
            <View
              key={i}
              className="flex-row items-start space-x-2 border-b border-gray-200 pb-2"
            >
              <View className="w-6 items-center pt-2">
                <Text className="text-base font-bold text-gray-700">{displayTier}</Text>
              </View>

              <View className="flex-1 flex-row flex-wrap gap-2 bg-gray-100 min-h-[50px] px-2 py-2 rounded-xl border border-gray-300">
                {tier.length === 0 ? (
                  <Text className="text-gray-400 italic">Empty</Text>
                ) : (
                  tier.map((player) => (
                    <View
                      key={player.key}
                      className={`px-3 py-1 rounded-full ${player.color} shadow self-start`}
                    >
                      <Text className="text-black font-medium">{player.name}</Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}