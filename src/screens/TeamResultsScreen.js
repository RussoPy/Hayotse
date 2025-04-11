import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function TeamResultsScreen() {
  const route = useRoute();
  const { allPlayers = [], numTeams, playersPerTeam, tieredPlayers = [] } = route.params;

  const [teams, setTeams] = useState([]);

  // Assign tier scores: Tier 1 -> 5, Tier 2 -> 4, ..., Tier 5 -> 1
  const assignTierScore = (player) => {
    for (let i = 0; i < tieredPlayers.length; i++) {
      if (tieredPlayers[i].some(p => p.id === player.id)) {
        return 5 - i; // Tier 1 (index 0) gets 5, Tier 2 (index 1) gets 4, etc.
      }
    }
    return 1; // Default to 1 if not found
  };

  const buildBalancedTeams = () => {
    // Shuffle players to ensure randomness
    const shuffledPlayers = [...allPlayers].sort(() => Math.random() - 0.5);

    // Assign scores to players
    const playersWithScores = shuffledPlayers.map(player => ({
      ...player,
      score: assignTierScore(player),
    }));

    // Sort players by score descending
    playersWithScores.sort((a, b) => b.score - a.score);

    // Initialize teams array
    const newTeams = Array.from({ length: numTeams }, () => ({
      players: [],
      totalScore: 0,
    }));

    // Distribute players to balance total team scores
    playersWithScores.forEach(player => {
      // Sort teams by totalScore ascending
      newTeams.sort((a, b) => a.totalScore - b.totalScore);
      // Assign player to the team with the lowest totalScore
      newTeams[0].players.push(player);
      newTeams[0].totalScore += player.score;
    });

    setTeams(newTeams.map(team => team.players));
  };

  useEffect(() => {
    buildBalancedTeams();
  }, []);

  return (
    <ScrollView className="flex-1 bg-zinc-900 px-4 pt-12">
      <Text className="text-3xl font-bold text-amber-400 mb-6 text-center">Balanced Teams</Text>

      <TouchableOpacity
        onPress={buildBalancedTeams}
        className="bg-amber-400 mb-6 py-2 px-6 rounded-xl self-center"
      >
        <Text className="text-black font-bold text-center">Scramble Teams</Text>
      </TouchableOpacity>

      <View className="flex flex-col gap-6 items-center pb-20">
        {teams.map((team, i) => (
          <View
            key={i}
            className="bg-zinc-800 rounded-xl px-4 py-4 border border-zinc-700 w-full max-w-[320px]"
          >
            <Text className="text-white font-bold text-lg mb-2 text-center">Team {i + 1}</Text>
            {team.map((player) => (
              <Text key={player.id} className="text-white text-center">
                • {player.name} <Text className="text-xs text-gray-400">(Tier Score: {player.score})</Text>
              </Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
