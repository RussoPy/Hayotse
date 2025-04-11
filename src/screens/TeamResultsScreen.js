import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Animated, { FadeInUp, FadeIn, Layout } from 'react-native-reanimated';
import * as Linking from 'expo-linking';

function assignTierScore(player, tieredPlayers) {
  const tiers = tieredPlayers.length;
  for (let i = 0; i < tiers; i++) {
    if (tieredPlayers[i].some(p => p.id === player.id)) {
      return tiers - i; // Highest tier gets highest score
    }
  }
  return 1;
}

export default function TeamResultsScreen() {
  const route = useRoute();
  const { allPlayers = [], numTeams, playersPerTeam, tieredPlayers = [] } = route.params;

  const [teams, setTeams] = useState([]);
  const [scrambleKey, setScrambleKey] = useState(0);

  const buildBalancedTeams = (retry = 0) => {
    const shuffled = [...allPlayers].sort(() => Math.random() - 0.5);
    const scored = shuffled.map(p => ({ ...p, score: assignTierScore(p, tieredPlayers) }));
    scored.sort((a, b) => b.score - a.score);
  
    const exactTotal = numTeams * playersPerTeam;
    if (scored.length !== exactTotal) return;
  
    const newTeams = Array.from({ length: numTeams }, () => ({ players: [], totalScore: 0 }));
    for (const player of scored) {
      newTeams.sort((a, b) => a.totalScore - b.totalScore);
      newTeams[0].players.push(player);
      newTeams[0].totalScore += player.score;
    }
  
    const isBalanced = newTeams.every(t => t.players.length === playersPerTeam);
    if (isBalanced) {
      setTeams(newTeams.map(t => t.players));
    } else if (retry < 5) {
      buildBalancedTeams(retry + 1); // 🔁 try again safely up to 5 times
    } else {
      console.warn('Could not balance teams after 5 tries.');
    }
  };

  const shareToWhatsApp = () => {
    let message = '🏆 Team Results:\n';
    teams.forEach((team, index) => {
      message += `\nTeam ${index + 1}:\n`;
      team.forEach(player => {
        message += `- ${player.name}\n`;
      });
    });
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`);
  };

  useEffect(() => {
    buildBalancedTeams();
  }, []);

  return (
    <View className="flex-1 bg-zinc-900">
      <ScrollView className="px-4 pt-12 pb-36">
        <Animated.Text
          entering={FadeInUp.duration(600)}
          className="text-3xl font-bold text-amber-400 mb-6 text-center"
        >
          Balanced Teams
        </Animated.Text>

        <Animated.View entering={FadeIn.duration(400)} className="items-center">
          <TouchableOpacity
            onPress={() => {
              buildBalancedTeams();
              setScrambleKey(prev => prev + 1);
            }}
            className="bg-amber-400 mb-4 py-2 px-6 rounded-xl"
          >
            <Text className="text-black font-bold text-center">Scramble Teams</Text>
          </TouchableOpacity>
        </Animated.View>

        <View className="flex flex-col gap-6 items-center pb-20" key={scrambleKey}>
          {teams.map((team, i) => {
            const average = team.reduce((sum, p) => sum + p.score, 0) / team.length;
            return (
              <Animated.View
                key={`${scrambleKey}-${i}`}
                entering={FadeInUp.delay(i * 100).duration(400)}
                layout={Layout.springify()}
                className="bg-zinc-800 rounded-xl px-4 py-4 border border-zinc-700 w-full max-w-[320px]"
              >
                <Text className="text-white font-bold text-lg text-center mb-1">Team {i + 1}</Text>
                <Text className="text-sm text-gray-400 text-center mb-2">Avg Score: {average.toFixed(2)}</Text>
                {team.map((player) => (
                  <Text key={player.id} className="text-white text-center">
                    • {player.name}
                  </Text>
                ))}
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      <View className="absolute bottom-6 left-0 right-0 items-center px-4">
        <TouchableOpacity
          onPress={shareToWhatsApp}
          className="bg-green-500 py-3 px-6 rounded-xl w-full max-w-[320px]"
        >
          <Text className="text-white font-bold text-center">Share to WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}