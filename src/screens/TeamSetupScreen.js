import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function TeamSetupScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { allPlayers = [] } = route.params;

  const totalPlayers = allPlayers.length;

  const getValidTeamOptions = () => {
    const options = [];
    for (let i = 2; i < totalPlayers; i++) {
      if (totalPlayers % i === 0) {
        const perTeam = totalPlayers / i;
        if (perTeam > 1) {
          options.push({ teams: i, playersPerTeam: perTeam });
        }
      }
    }
    return options;
  };

  const handleSelect = (teams, playersPerTeam) => {
    console.log('Navigating with:', teams, playersPerTeam);
    navigation.navigate('TeamResults', {
      allPlayers,
      numTeams: teams,
      playersPerTeam,
      tieredPlayers: route.params.tieredPlayers,
    });
  };

  return (
    <ScrollView className="flex-1 bg-zinc-900 px-4 pt-16">
      <Text className="text-3xl font-bold text-amber-400 mb-6 text-center">Choose a Team Option</Text>

      <Text className="text-gray-400 text-base mb-4 text-center">
        Total players: {totalPlayers}
      </Text>

      <View className="flex flex-col gap-4 items-center">
        {getValidTeamOptions().map((opt, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => handleSelect(opt.teams, opt.playersPerTeam)}
            className="bg-amber-400 px-6 py-3 rounded-xl w-full max-w-[300px]"
          >
            <Text className="text-black font-bold text-center">
              {opt.teams} teams of {opt.playersPerTeam}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}