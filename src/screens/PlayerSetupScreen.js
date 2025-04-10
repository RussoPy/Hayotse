import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PlayerSetupScreen({ navigation }) {
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);

  const COLORS = [
    'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400',
    'bg-pink-400', 'bg-orange-400', 'bg-teal-400', 'bg-lime-400', 'bg-amber-400',
  ];

  const addOrEditPlayer = () => {
    if (!name.trim()) return;
    if (editId) {
      setPlayers((prev) => prev.map(p => p.id === editId ? { ...p, name } : p));
      setEditId(null);
    } else {
      const newPlayer = {
        id: Date.now().toString(),
        name: name.trim(),
        color: COLORS[players.length % COLORS.length],
        key: Date.now().toString(),
      };
      setPlayers(prev => [...prev, newPlayer]);
    }
    setName('');
  };

  const removePlayer = (id) => {
    setPlayers((prev) => prev.filter(p => p.id !== id));
    if (editId === id) setEditId(null);
  };

  const editPlayer = (player) => {
    setEditId(player.id);
    setName(player.name);
  };

  return (
    <View className="flex-1 bg-zinc-900 px-4 pt-10 pb-6">
      <Text className="text-3xl font-bold text-white mb-6 text-center">Team Builder Setup</Text>

      <View className="flex-row items-center mb-6 gap-2">
        <TextInput
          className="flex-1 bg-white text-black rounded-xl px-4 py-2"
          placeholder="Enter player name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
          onSubmitEditing={addOrEditPlayer}
        />
        <TouchableOpacity
          onPress={addOrEditPlayer}
          className="bg-amber-400 px-4 py-2 rounded-xl"
        >
          <Text className="text-black font-semibold">{editId ? 'Update' : 'Add'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 80 }}
        renderItem={({ item }) => (
          <View className="flex-row justify-between items-center bg-zinc-800 p-4 rounded-xl">
            <Text className="text-white text-lg">{item.name}</Text>
            <View className="flex-row gap-4">
              <TouchableOpacity onPress={() => editPlayer(item)}>
                <Ionicons name="pencil" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removePlayer(item.id)}>
                <Ionicons name="trash" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View className="absolute bottom-6 left-4 right-4">
        <TouchableOpacity
          onPress={() => {
            console.log('Navigating with players:', players);
            navigation.navigate('TierList', { players });
          }}
          disabled={players.length === 0}
          className="bg-amber-500 py-4 rounded-xl"
        >
          <Text className="text-center text-black font-bold text-lg">Continue ➜</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}