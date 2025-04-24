import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../utils/firebaseConfig';
import { ref, set, get } from 'firebase/database';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import Toast from 'react-native-toast-message';

export default function PlayerSetupScreen({ navigation }) {
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);
  const [loadedFromDB, setLoadedFromDB] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const COLORS = [
    'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400',
    'bg-pink-400', 'bg-orange-400', 'bg-teal-400', 'bg-lime-400', 'bg-amber-400',
  ];

  const showToast = (msg) => {
    Toast.show({ type: 'success', text1: msg });
  };

  // Watch Firebase auth state and load data only once
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user && !user.isAnonymous) {
        const userRef = ref(db, `users/${user.uid}/players`);
        try {
          const snapshot = await get(userRef);
          const data = snapshot.val();
          if (data && Array.isArray(data)) {
            setPlayers(data);
            showToast('👋 Welcome back!');
          }
        } catch (err) {
          console.warn('Error loading players:', err.message);
        }
      }
      setLoadedFromDB(true);
    });
    return () => unsub();
  }, []);

  // Save to DB only after data loaded + not guest
  useEffect(() => {
    if (currentUser && !currentUser.isAnonymous && loadedFromDB) {
      const userRef = ref(db, `users/${currentUser.uid}/players`);
      set(userRef, players);
    }
  }, [players, loadedFromDB]);

  const addOrEditPlayer = () => {
    if (!name.trim()) return;
    if (editId) {
      setPlayers((prev) => prev.map(p => p.id === editId ? { ...p, name } : p));
      setEditId(null);
    } else {
      const id = Date.now().toString();
      setPlayers(prev => [
        ...prev,
        { id, name: name.trim(), color: COLORS[prev.length % COLORS.length], key: id },
      ]);
    }
    setName('');
  };

  const addUnknownPlayer = () => {
    const count = players.filter(p => p.name.startsWith('Unknown')).length + 1;
    const id = Date.now().toString();
    setPlayers(prev => [
      ...prev,
      { id, name: `Unknown ${count}`, color: COLORS[prev.length % COLORS.length], key: id },
    ]);
  };

  const removePlayer = (id) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
    if (editId === id) setEditId(null);
  };

  const editPlayer = (player) => {
    setEditId(player.id);
    setName(player.name);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      Toast.show({ type: 'error', text1: 'Logout failed' });
    }
  };

  const isPrime = (num) => {
    if (num < 2) return true;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  };

  const canContinue = players.length > 0 && !isPrime(players.length);

  return (
    <View className="flex-1 bg-zinc-900 px-4 pt-10 pb-6">

      {/* Logout Button */}
      <View className="absolute right-4 top-10 z-10">
        <TouchableOpacity onPress={handleLogout} className="bg-red-500 px-4 py-2 rounded-xl">
          <Text className="text-white font-bold">Logout</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-3xl font-bold text-amber-400 mb-10 text-left">Adding players</Text>

      <View className="flex-row items-center mb-4 gap-2">
        <TextInput
          maxLength={16}
          className="flex-1 bg-white text-black rounded-xl px-4 py-2"
          placeholder="Name..."
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
        <TouchableOpacity
          onPress={addUnknownPlayer}
          className="bg-gray-300 px-3 py-2 rounded-xl"
        >
          <Text className="text-black font-semibold">+ Unknown</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-white text-base mb-2">({players.length})</Text>

      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 80 }}
        renderItem={({ item }) => (
          <View className="flex-row justify-between items-center bg-zinc-800 p-4 rounded-xl">
            <View className="flex-row items-center gap-2">
              <View className={`w-3 h-3 rounded-full ${item.color}`} />
              <Ionicons name="person-circle-outline" size={24} color="white" />
              <Text className="text-white text-lg">{item.name}</Text>
            </View>
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

      {/* Continue Button */}
      <View className="absolute bottom-6 left-4 right-4">
        <TouchableOpacity
          onPress={() => navigation.navigate('TierList', { players })}
          disabled={!canContinue}
          className={`py-4 rounded-xl ${canContinue ? 'bg-amber-500' : 'bg-zinc-700'}`}
        >
          <Text className="text-center text-black font-bold text-lg">
            {canContinue ? 'Continue ➜' : 'Not enough players'}
          </Text>
        </TouchableOpacity>
      </View>

      <Toast />
    </View>
  );
}
