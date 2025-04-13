// TeamResultsScreen: Displays balanced teams based on tier scores
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Animated, { FadeInUp, FadeIn, Layout } from 'react-native-reanimated';
import * as Linking from 'expo-linking';

// Assign score based on tier
function assignTierScore(player, tieredPlayers) {
  const actualTierCount = tieredPlayers.length - 1;
  const unknownTier = tieredPlayers[actualTierCount];

  if (unknownTier.some(p => p.id === player.id)) {
    return Math.ceil(actualTierCount / 2); // Middle score for unknowns
  }

  for (let i = 0; i < actualTierCount; i++) {
    if (tieredPlayers[i].some(p => p.id === player.id)) {
      return actualTierCount - i; // Highest tier = highest score
    }
  }

  return 1; // fallback
}

// Shuffle players
function shuffleArray(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

// Measure how balanced the teams are
function getTeamVariance(teams) {
  const averages = teams.map(t => t.totalScore / t.players.length);
  const avg = averages.reduce((sum, val) => sum + val, 0) / averages.length;
  return averages.reduce((sum, val) => sum + (val - avg) ** 2, 0) / averages.length;
}

export default function TeamResultsScreen() {
  const route = useRoute();
  const { allPlayers = [], numTeams, playersPerTeam, tieredPlayers = [] } = route.params;

  const [teams, setTeams] = useState([]);
  const [scrambleKey, setScrambleKey] = useState(0);

  const buildBalancedTeams = () => {
    const totalExpected = numTeams * playersPerTeam;
    if (allPlayers.length !== totalExpected) {
      console.warn('Invalid team config. Not building teams.');
      setTeams([]);
      return;
    }

    let bestTeams = null;
    let bestVariance = Infinity;

    for (let attempt = 0; attempt < 50; attempt++) {
      const shuffled = shuffleArray(allPlayers);
      const scored = shuffled.map(p => ({
        ...p,
        score: assignTierScore(p, tieredPlayers),
      }));

      scored.sort((a, b) => b.score - a.score);

      const newTeams = Array.from({ length: numTeams }, () => ({ players: [], totalScore: 0 }));

      for (const player of scored) {
        newTeams.sort((a, b) => a.totalScore - b.totalScore);
        newTeams[0].players.push(player);
        newTeams[0].totalScore += player.score;
      }

      const teamsWithGoalie = newTeams.map(team => {
        const randomIndex = Math.floor(Math.random() * team.players.length);
        return {
          ...team,
          goalieId: team.players[randomIndex].id,
        };
      });

      const isBalanced = teamsWithGoalie.every(t => t.players.length === playersPerTeam);
      if (!isBalanced) continue;

      const variance = getTeamVariance(teamsWithGoalie);
      if (variance < bestVariance) {
        bestVariance = variance;
        bestTeams = teamsWithGoalie;
      }
    }

    if (bestTeams) {
      setTeams(bestTeams);
    } else {
      console.warn('Could not generate balanced teams after multiple attempts.');
      setTeams([]);
    }
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

      <View className="flex flex-col gap-6 items-center pb-12" key={scrambleKey}>
        {teams.length === 0 ? (
          <Text className="text-gray-400 italic text-center mt-12">
            No teams to display. Make sure players divide evenly.
          </Text>
        ) : (
          teams.map((team, i) => {
            const average = team.totalScore / team.players.length;
            return (
              <Animated.View
                key={`${scrambleKey}-${i}`}
                entering={FadeInUp.delay(i * 100).duration(400)}
                layout={Layout.springify()}
                className="bg-zinc-800 rounded-xl px-4 py-4 border border-zinc-700 w-full max-w-[320px]"
              >
                <Text className="text-white font-bold text-lg text-center mb-1">
                  Team {i + 1}
                </Text>
                <Text className="text-sm text-gray-400 text-center mb-2">
                  Avg Score: {average.toFixed(2)}
                </Text>
                {team.players.map(player => (
                  <Text key={player.id} className="text-white text-center">
                    • {player.name}{player.id === team.goalieId ? ' 🧤' : ''}
                  </Text>
                ))}
              </Animated.View>
            );
          })
        )}
      </View>

      {teams.length > 0 && (
        <View className="items-center">
          <TouchableOpacity
            onPress={shareToWhatsApp}
            className="bg-green-500 py-3 px-6 rounded-xl mb-20 w-full max-w-[320px]"
          >
            <Text className="text-white font-bold text-center">Share to WhatsApp</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
