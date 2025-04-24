import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

function assignTierScore(player, tieredPlayers) {
  const actualTierCount = tieredPlayers.length - 1;
  const unknownTier = tieredPlayers[actualTierCount];

  if (unknownTier.some(p => p.id === player.id)) {
    return Math.ceil(actualTierCount / 2);
  }

  for (let i = 0; i < actualTierCount; i++) {
    if (tieredPlayers[i].some(p => p.id === player.id)) {
      return actualTierCount - i;
    }
  }

  return 1;
}

export default function TeamResultsScreen() {
  const route = useRoute();
  const { allPlayers = [], numTeams, playersPerTeam, tieredPlayers = [] } = route.params;

  const [teams, setTeams] = useState([]);
  const [warning, setWarning] = useState(false);
  const [notEnoughPlayers, setNotEnoughPlayers] = useState(false);
  const [scrambledOnce, setScrambledOnce] = useState(false);

  const buildBalancedTeams = () => {
    const totalExpected = numTeams * playersPerTeam;
    if (allPlayers.length !== totalExpected) {
      setNotEnoughPlayers(true);
      setTeams([]);
      return;
    }

    const scoredPlayers = allPlayers.map(p => ({
      ...p,
      score: assignTierScore(p, tieredPlayers),
    }));

    scoredPlayers.sort((a, b) => b.score - a.score);

    const newTeams = Array.from({ length: numTeams }, () => []);

    scoredPlayers.forEach((player, idx) => {
      const teamIdx = Math.floor(idx / numTeams) % 2 === 0
        ? idx % numTeams
        : numTeams - 1 - (idx % numTeams);
      newTeams[teamIdx].push(player);
    });

    const teamsWithScores = newTeams.map(team => {
      const totalScore = team.reduce((sum, p) => sum + p.score, 0);
      const goalieId = team[Math.floor(Math.random() * team.length)].id;
      return { players: team, totalScore, goalieId };
    });

    const avgScores = teamsWithScores.map(t => t.totalScore / t.players.length);
    const variance = Math.max(...avgScores) - Math.min(...avgScores);

    setWarning(variance > 1.5);
    setTeams(teamsWithScores);
    setNotEnoughPlayers(false);
  };

  const handleScramble = () => {
    if (scrambledOnce || notEnoughPlayers) return;

    const shuffledPlayers = [...allPlayers]
      .map(p => ({ ...p, score: assignTierScore(p, tieredPlayers) }))
      .sort(() => Math.random() - 0.5);

    const scrambledTeams = Array.from({ length: numTeams }, () => []);

    shuffledPlayers.forEach((player, idx) => {
      scrambledTeams[idx % numTeams].push(player);
    });

    const teamsWithScores = scrambledTeams.map(team => {
      const totalScore = team.reduce((sum, p) => sum + p.score, 0);
      const goalieId = team[Math.floor(Math.random() * team.length)].id;
      return { players: team, totalScore, goalieId };
    });

    setTeams(teamsWithScores);
    setScrambledOnce(true);
  };

  const shareToWhatsApp = () => {
    let message = '🏆 Team Results:\n';
    teams.forEach((team, index) => {
      message += `\nTeam ${index + 1}:\n`;
      team.players.forEach(player => {
        const isGoalie = player.id === team.goalieId;
        message += `- ${player.name}${isGoalie ? ' 🧤' : ''}\n`;
      });
    });
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`);
  };

  useEffect(() => {
    buildBalancedTeams();
  }, []);

  return (
    <ScrollView className="flex-1 bg-zinc-900 px-4 pt-12 pb-16">
      <Text className="text-3xl font-bold text-amber-400 mb-4 text-center">Balanced Teams</Text>

      {notEnoughPlayers && (
        <View className="bg-red-500/20 border border-red-400 px-4 py-2 rounded-xl mb-4 mx-4">
          <Text className="text-red-300 text-center font-semibold">
            ⚠️ Not enough players to form equal teams.
          </Text>
        </View>
      )}

      {warning && !notEnoughPlayers && (
        <View className="bg-yellow-500/20 border border-yellow-400 px-4 py-2 rounded-xl mb-4 mx-4">
          <Text className="text-yellow-300 text-center font-semibold">
            ⚠️ Teams might not be perfectly balanced.
          </Text>
        </View>
      )}

      <TouchableOpacity
        disabled={notEnoughPlayers || scrambledOnce}
        onPress={handleScramble}
        className={`mb-4 py-2 px-6 rounded-xl ${
          notEnoughPlayers || scrambledOnce ? 'bg-zinc-600' : 'bg-amber-400'
        }`}
      >
        <Text
          className={`font-bold text-center ${
            notEnoughPlayers || scrambledOnce ? 'text-gray-400' : 'text-black'
          }`}
        >
          Scramble Teams
        </Text>
      </TouchableOpacity>

      <View className="flex flex-col gap-6 items-center pb-12">
        {teams.map((team, i) => (
          <View
            key={i}
            className="bg-zinc-800 rounded-xl px-4 py-4 border border-zinc-700 w-full max-w-[320px]"
          >
            <Text className="text-white font-bold text-lg text-center mb-1">Team {i + 1}</Text>
            {team.players.map(p => (
              <Text key={p.id} className="text-white text-center">
                • {p.name}{p.id === team.goalieId ? ' 🧤' : ''}
              </Text>
            ))}
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={shareToWhatsApp}
        className="bg-green-500 py-3 px-6 rounded-xl mb-20 w-full max-w-[320px] self-center"
      >
        <Text className="text-white font-bold text-center">Share to WhatsApp</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}