/*TeamListScreen.js*/ 
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const COLORS = [
  'bg-red-300', 'bg-yellow-300', 'bg-green-300', 'bg-blue-300', 'bg-purple-300',
  'bg-pink-300', 'bg-orange-300', 'bg-teal-300', 'bg-lime-300', 'bg-amber-300',
];

export default function TierListScreen({ route }) {
  const navigation = useNavigation();
  const { players } = route.params;
  const [tierCount, setTierCount] = useState(5);
  const [unassigned, setUnassigned] = useState([]);
  const [tieredPlayers, setTieredPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const colored = players.map((p, i) => ({
      ...p,
      color: COLORS[i % COLORS.length],
      key: p.id.toString(),
    }));

    const newTiers = Array.from({ length: tierCount + 1 }, () => []);
    const unknowns = colored.filter(p => p.name.toLowerCase().startsWith('unknown'));
    const known = colored.filter(p => !p.name.toLowerCase().startsWith('unknown'));

    const middleValue = Math.floor(tierCount / 2) + 1;
    unknowns.forEach(p => {
      newTiers[tierCount].push({ ...p, score: middleValue });
    });

    setTieredPlayers(newTiers);
    setUnassigned(known);
  }, [players, tierCount]);

  const handleTierCountToggle = () => {
    const allTiered = tieredPlayers.flat();
    setUnassigned(prev => [...prev, ...allTiered]);
    const newCount = tierCount === 5 ? 10 : 5;
    setTieredPlayers(Array.from({ length: newCount + 1 }, () => []));
    setTierCount(newCount);
  };

  const assignToTier = (player, targetTierIndex) => {
    setUnassigned(prev => prev.filter(p => p.key !== player.key));
    setTieredPlayers(prev => {
      const newTiers = prev.map(tier => tier.filter(p => p.key !== player.key));
      newTiers[targetTierIndex].push(player);
      return newTiers;
    });
    setShowModal(false);
  };

  const moveToPool = (player) => {
    setTieredPlayers(prev => prev.map(tier => tier.filter(p => p.key !== player.key)));
    setUnassigned(prev => [...prev, player]);
    setShowModal(false);
  };

  const handlePlayerPress = (player, fromTier = null) => {
    setSelectedPlayer({ player, fromTier });
    setShowModal(true);
  };

  const renderBadge = (player, fromTier = null) => (
    <TouchableOpacity
      key={player.key}
      onPress={() => handlePlayerPress(player, fromTier)}
      className={`px-3 py-1 rounded-full ${player.color} shadow self-start`}
    >
      <Text className="text-black font-medium">{player.name}</Text>
    </TouchableOpacity>
  );

  const allAssigned = unassigned.length === 0;

  return (
    <ScrollView className="flex-1 bg-zinc-900 px-4 pt-12">
      <View className="items-end mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="white" />
        </TouchableOpacity>
      </View>

      <Text className="text-3xl font-bold text-amber-400 mb-2 text-center">Organize Tiers</Text>

      <TouchableOpacity
        className="mb-4 bg-amber-400 rounded-xl py-2 px-4 self-center"
        onPress={handleTierCountToggle}
      >
        <Text className="text-black font-bold">Switch to {tierCount === 5 ? '10' : '5'} Tiers</Text>
      </TouchableOpacity>

      <Text className="text-amber-400 text-center text-base font-semibold italic mb-2">Tap to add</Text>
      <View className="w-full bg-zinc-800 p-3 rounded-xl border border-zinc-700 min-h-[70px] flex-row flex-wrap gap-2 mb-6">
        {unassigned.map(player => renderBadge(player))}
      </View>

      <View className="w-full space-y-4 pb-16">
        {tieredPlayers.map((tier, i) => {
          const isTopTier = i === 0;
          const isBottomTier = i === tierCount - 1;
          const isUnknownTier = i === tierCount;
          const displayTier = isUnknownTier ? '?' : `${tierCount - i}`;

          return (
            <View key={i} className="flex-row items-start space-x-3">
              <View className="w-6 items-center pt-2">
                <Text className="text-white font-bold text-lg leading-none text-center whitespace-nowrap">{displayTier}</Text>
              </View>
              <View className="flex-1 flex-row flex-wrap gap-2 bg-zinc-800 min-h-[60px] px-2 py-2 rounded-xl border border-zinc-700">
                {isTopTier && <Text className="text-xs text-gray-400 mb-1">(Highest value)</Text>}
                {isBottomTier && <Text className="text-xs text-gray-400 mb-1">(Lowest value)</Text>}
                {isUnknownTier && <Text className="text-xs text-gray-400 mb-1">(Uncertain value)</Text>}
                {tier.length === 0 ? (
                  <Text className="text-gray-400 italic">Empty</Text>
                ) : (
                  tier.map(player => renderBadge(player, i))
                )}
              </View>
            </View>
          );
        })}

        {allAssigned && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('TeamSetup', {
                allPlayers: tieredPlayers.flat(),
                tieredPlayers,
              })
            }
            className="bg-amber-400 mt-8 mb-16 py-3 px-6 rounded-xl self-center"
          >
            <Text className="text-black font-bold text-lg">NEXT</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        transparent
        visible={showModal}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-8">
          <View className="bg-white rounded-xl w-full p-5">
            <Text className="text-xl font-bold text-center mb-4 text-zinc-800">
              Assign {selectedPlayer?.player?.name}
            </Text>
            <View className="flex flex-wrap flex-row justify-center gap-2">
              {Array.from({ length: tierCount + 1 }, (_, i) => (
                <TouchableOpacity
                  key={i}
                  className="bg-amber-400 px-4 py-2 rounded-lg"
                  onPress={() => assignToTier(selectedPlayer.player, i)}
                >
                  <Text className="text-black font-bold">
                    {i === tierCount ? '?' : `Tier ${tierCount - i}`}
                  </Text>
                </TouchableOpacity>
              ))}
              {selectedPlayer?.fromTier !== null && (
                <TouchableOpacity
                  onPress={() => moveToPool(selectedPlayer.player)}
                  className="bg-red-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-bold">Return to Pool</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded-lg"
              >
                <Text className="text-zinc-800 font-bold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}