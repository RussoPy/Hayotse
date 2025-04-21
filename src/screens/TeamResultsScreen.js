import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Animated, { FadeInUp, FadeIn, Layout } from 'react-native-reanimated';
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

function getTeamCombinations(players, numTeams, playersPerTeam) {
  const all = (arr, size) => {
    if (size === 0) return [[]];
    if (arr.length < size) return [];
    const [first, ...rest] = arr;
    const withFirst = all(rest, size - 1).map(g => [first, ...g]);
    const withoutFirst = all(rest, size);
    return [...withFirst, ...withoutFirst];
  };

  const usedIndices = new Set();
  const results = [];

  const build = (startIndex, current) => {
    if (current.length === numTeams) {
      const flat = current.flat();
      if (flat.length === players.length) {
        results.push([...current]);
      }
      return;
    }
    for (let i = startIndex; i < players.length; i++) {
      const teamCombos = all(players.filter((_, idx) => !usedIndices.has(idx)), playersPerTeam);
      for (let team of teamCombos) {
        const indices = team.map(p => players.indexOf(p));
        if (indices.some(idx => usedIndices.has(idx))) continue;
        indices.forEach(idx => usedIndices.add(idx));
        current.push(team);
        build(i + 1, current);
        current.pop();
        indices.forEach(idx => usedIndices.delete(idx));
      }
    }
  };

  build(0, []);
  return results;
}

function varianceOfTeams(teams) {
  const avgs = teams.map(team => {
    const total = team.reduce((sum, p) => sum + p.score, 0);
    return total / team.length;
  });
  const min = Math.min(...avgs);
  const max = Math.max(...avgs);
  return max - min;
}

export default function TeamResultsScreen() {
  const route = useRoute();
  const { allPlayers = [], numTeams, playersPerTeam, tieredPlayers = [] } = route.params;

  const [teams, setTeams] = useState([]);
  const [scrambleKey, setScrambleKey] = useState(0);
  const [warning, setWarning] = useState(false);
  const [notEnoughPlayers, setNotEnoughPlayers] = useState(false);
  const [scrambledOnce, setScrambledOnce] = useState(false);
  const [bestCombination, setBestCombination] = useState(null);
  const [secondBest, setSecondBest] = useState(null);

  const buildBestTeams = () => {
    const totalExpected = numTeams * playersPerTeam;
    if (allPlayers.length !== totalExpected) {
      setWarning(false);
      setNotEnoughPlayers(true);
      setTeams([]);
      return;
    }

    const scored = allPlayers.map(p => ({
      ...p,
      score: assignTierScore(p, tieredPlayers),
    }));

    const combinations = getTeamCombinations(scored, numTeams, playersPerTeam);
    if (combinations.length === 0) {
      setWarning(false);
      setNotEnoughPlayers(true);
      setTeams([]);
      return;
    }

    const sortedCombos = combinations
      .map(combo => ({
        combo,
        variance: varianceOfTeams(combo),
      }))
      .sort((a, b) => a.variance - b.variance);

    const best = sortedCombos[0];
    const second = sortedCombos[1];

    const bestTeamsWithGoalie = best.combo.map(team => {
      const randomIndex = Math.floor(Math.random() * team.length);
      return {
        players: team,
        totalScore: team.reduce((sum, p) => sum + p.score, 0),
        goalieId: team[randomIndex]?.id,
      };
    });

    setWarning(best.variance > 1.25);
    setNotEnoughPlayers(false);
    setTeams(bestTeamsWithGoalie);
    setBestCombination(bestTeamsWithGoalie);

    if (second) {
      const secondWithGoalie = second.combo.map(team => {
        const randomIndex = Math.floor(Math.random() * team.length);
        return {
          players: team,
          totalScore: team.reduce((sum, p) => sum + p.score, 0),
          goalieId: team[randomIndex]?.id,
        };
      });
      setSecondBest(secondWithGoalie);
    }
  };

  const handleScramble = () => {
    if (!scrambledOnce && secondBest) {
      setScrambledOnce(true);
      setTeams(secondBest);
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
    buildBestTeams();
  }, []);

  return (
    <ScrollView className="flex-1 bg-zinc-900 px-4 pt-12 pb-16">
      <Animated.Text
        entering={FadeInUp.duration(600)}
        className="text-3xl font-bold text-amber-400 mb-4 text-center"
      >
        Balanced Teams
      </Animated.Text>

      {notEnoughPlayers && (
        <View className="bg-red-500/20 border border-red-400 px-4 py-2 rounded-xl mb-4 mx-4">
          <Text className="text-red-300 text-center font-semibold">
            ⚠️ Not enough players to form the desired number of teams with equal size.
          </Text>
        </View>
      )}

      {warning && !notEnoughPlayers && (
        <View className="bg-yellow-500/20 border border-yellow-400 px-4 py-2 rounded-xl mb-4 mx-4">
          <Text className="text-yellow-300 text-center font-semibold">
            ⚠️ Teams might not be fully balanced due to player distribution.
          </Text>
        </View>
      )}

      <Animated.View entering={FadeIn.duration(400)} className="items-center">
        <TouchableOpacity
          disabled={notEnoughPlayers || scrambledOnce}
          onPress={handleScramble}
          className={`mb-4 py-2 px-6 rounded-xl ${
            notEnoughPlayers || scrambledOnce ? 'bg-zinc-600' : 'bg-amber-400'
          }`}
        >
          <Text className={`font-bold text-center ${notEnoughPlayers || scrambledOnce ? 'text-gray-400' : 'text-black'}`}>
            Scramble Teams
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <View className="flex flex-col gap-6 items-center pb-12" key={scrambleKey}>
        {teams.length === 0 && !notEnoughPlayers ? (
          <Text className="text-gray-400 italic text-center mt-12">
            No teams to display.
          </Text>
        ) : (
          teams.map((team, i) => {
            const average = team.players.length > 0 ? team.totalScore / team.players.length : 0;
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
