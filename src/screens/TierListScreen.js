import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const COLORS = [
  'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400',
  'bg-pink-400', 'bg-orange-400', 'bg-teal-400', 'bg-lime-400', 'bg-amber-400',
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
    setUnassigned(colored);
  }, [players]);

  const handleTierCountToggle = () => {
    const allTiered = tieredPlayers.flat();
    setUnassigned(prev => [...prev, ...allTiered]);
    setTierCount(prev => (prev === 5 ? 10 : 5));
  };

  useEffect(() => {
    setTieredPlayers(Array.from({ length: tierCount }, () => []));
  }, [tierCount]);

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
      className={`px-3 py-1 rounded-full ${player.color} shadow self-start bg-white`}
    >
      <Text className="text-black font-medium">{player.name}</Text>
    </TouchableOpacity>
  );

  const allAssigned = unassigned.length === 0;

  return (
    <ScrollView className="flex-1 bg-zinc-900 px-4 pt-12">
      <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
        <Ionicons name="arrow-back" size={26} color="white" />
      </TouchableOpacity>

      <Text className="text-3xl font-bold text-amber-400 mb-2 text-center">Organize Tiers</Text>

      <TouchableOpacity
        className="mb-4 bg-amber-400 rounded-xl py-2 px-4 self-center"
        onPress={handleTierCountToggle}
      >
        <Text className="text-black font-bold">Switch to {tierCount === 5 ? '10' : '5'} Tiers</Text>
      </TouchableOpacity>

      <View className="w-full bg-zinc-800 p-3 rounded-xl border border-zinc-700 min-h-[70px] flex-row flex-wrap gap-2 mb-6">
        {unassigned.map(player => renderBadge(player))}
      </View>

      <View className="w-full space-y-4 pb-16">
  {tieredPlayers.map((tier, i) => {
    const displayTier = tierCount - i;
    return (
      <View key={i} className="flex-row items-start space-x-3">
        <View className="w-6 items-center pt-2">
          <Text className="text-white font-bold text-lg">{displayTier}</Text>
        </View>
        <View className="flex-1 flex-row flex-wrap gap-2 bg-zinc-800 min-h-[60px] px-2 py-2 rounded-xl border border-zinc-700">
          {tier.length === 0 ? (
            <Text className="text-gray-400 italic">Drop players here</Text>
          ) : (
            tier.map(player => renderBadge(player, i))
          )}
        </View>
      </View>
    );
  })}

  {/* ✅ Add this NEXT button after all players are assigned */}
  {unassigned.length === 0 && (
    <TouchableOpacity
    onPress={() =>
      navigation.navigate('TeamSetup', {
        allPlayers: tieredPlayers.flat(),
        tieredPlayers: tieredPlayers,
      })
    }
      className="bg-amber-400 rounded-xl py-3 px-6 mt-8 mb-16 self-center"
    >
      <Text className="text-black font-bold text-lg">NEXT</Text>
    </TouchableOpacity>
  )}
</View>

      <TouchableOpacity
        disabled={!allAssigned}
        onPress={() => navigation.navigate('TeamSetup', { tieredPlayers })}
        className={`mt-6 mb-10 rounded-xl py-3 px-6 ${allAssigned ? 'bg-amber-400' : 'bg-zinc-700'} self-center`}
      >
        <Text className="text-black font-bold">NEXT</Text>
      </TouchableOpacity>

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
              {Array.from({ length: tierCount }, (_, i) => (
                <TouchableOpacity
                  key={i}
                  className="bg-amber-400 px-4 py-2 rounded-lg"
                  onPress={() => assignToTier(selectedPlayer.player, i)}
                >
                  <Text className="text-black font-bold">Tier {tierCount - i}</Text>
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