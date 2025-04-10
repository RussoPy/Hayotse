import { View, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';

export default function TierSelector({ onSelect }) {
  const [selected, setSelected] = useState(null);
  const options = [3, 5, 10];

  const handleSelect = (value) => {
    setSelected(value);
    onSelect(value);
  };

  return (
    <View className="flex-row justify-center gap-3 my-4">
      {options.map((num) => (
        <TouchableOpacity
          key={num}
          onPress={() => handleSelect(num)}
          className={`px-4 py-2 rounded-full border ${
            selected === num
              ? 'bg-black border-black'
              : 'bg-white border-gray-400'
          }`}
        >
          <Text
            className={`text-lg ${
              selected === num ? 'text-white font-bold' : 'text-black'
            }`}
          >
            {num} Tiers
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
