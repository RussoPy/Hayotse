import { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, FlatList } from 'react-native';

export default function PlayerInput({ onChange }) {
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([]);

  const addPlayer = () => {
    if (!playerName.trim()) return;
  
    const newList = [...players, { id: Date.now().toString(), name: playerName.trim() }];
    setPlayers(newList);
    onChange(newList); // 👈 send up
    setPlayerName('');
  };
  const removePlayer = (id) => {
    const newList = players.filter(player => player.id !== id);
    setPlayers(newList);
    onChange(newList); // 👈 send up
  };

  return (
    <View className="w-full px-4 space-y-4">
      <TextInput
        placeholder="Enter player name"
        placeholderTextColor="#aaa"
        className="border border-gray-300 px-4 py-2 rounded-xl text-lg text-black bg-white"
        value={playerName}
        onChangeText={setPlayerName}
        onSubmitEditing={addPlayer}
      />

      <TouchableOpacity
        onPress={addPlayer}
        className="bg-black py-2 px-4 rounded-xl self-center"
      >
        <Text className="text-white text-lg">Add Player</Text>
      </TouchableOpacity>

      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        className="mt-4"
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between bg-gray-100 p-3 rounded-lg mb-2">
            <Text className="text-black text-lg">{item.name}</Text>
            <TouchableOpacity onPress={() => removePlayer(item.id)}>
              <Text className="text-red-500 font-bold">Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
