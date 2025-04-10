import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const COLORS = [
  'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400',
  'bg-pink-400', 'bg-orange-400', 'bg-teal-400', 'bg-lime-400', 'bg-amber-400',
];

const { width } = Dimensions.get('window');

export default function TierListScreen({ route, navigation }) {
  const { players } = route.params;
  const tierCount = 5;

  const [unassigned, setUnassigned] = useState([]);
  const [tieredPlayers, setTieredPlayers] = useState(
    Array.from({ length: tierCount }, () => [])
  );
  const tierLayouts = useRef([]);
  const poolLayout = useRef(null);

  useEffect(() => {
    const colored = players.map((p, i) => ({
      ...p,
      color: COLORS[i % COLORS.length],
      key: p.id.toString(),
    }));
    setUnassigned(colored);
  }, [players]);

  const moveToTier = (player, tierIndex) => {
    setUnassigned(prev => prev.filter(p => p.key !== player.key));
    setTieredPlayers(prev => {
      const newTiers = prev.map(tier => tier.filter(p => p.key !== player.key));
      newTiers[tierIndex] = [...newTiers[tierIndex], player];
      return newTiers;
    });
  };

  const moveToPool = (player) => {
    setTieredPlayers(prev => prev.map(tier => tier.filter(p => p.key !== player.key)));
    setUnassigned(prev => [...prev, player]);
  };

  const DraggablePlayer = ({ player }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const isDragging = useSharedValue(false);

    const gestureHandler = useAnimatedGestureHandler({
      onStart: (_, ctx) => {
        isDragging.value = true;
        ctx.startX = translateX.value;
        ctx.startY = translateY.value;
      },
      onActive: (event, ctx) => {
        translateX.value = ctx.startX + event.translationX;
        translateY.value = ctx.startY + event.translationY;
      },
      onEnd: (event) => {
        isDragging.value = false;
        runOnJS(checkDrop)(player, event.absoluteY);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      },
    });

    const style = useAnimatedStyle(() => ({
      position: 'absolute',
      zIndex: isDragging.value ? 999 : 0,
      left: 0,
      top: 0,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    }));

    return (
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[style, styles.floating]}>
          <View className={`px-3 py-1 rounded-full ${player.color} shadow self-start bg-white`}>
            <Text className="text-black font-medium">{player.name}</Text>
          </View>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  const checkDrop = (player, dropY) => {
    const correctedTiers = [...tierLayouts.current].reverse();
    for (let i = 0; i < correctedTiers.length; i++) {
      const layout = correctedTiers[i];
      if (!layout) continue;
      const { y, height } = layout;
      if (dropY >= y && dropY <= y + height) {
        moveToTier(player, i);
        return;
      }
    }
    if (poolLayout.current) {
      const { y, height } = poolLayout.current;
      if (dropY >= y && dropY <= y + height) {
        moveToPool(player);
      }
    }
  };

  return (
    <ScrollView className="flex-1 bg-zinc-900 px-4 pt-12">
      <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
        <Ionicons name="arrow-back" size={26} color="white" />
      </TouchableOpacity>

      <Text className="text-3xl font-bold text-amber-400 mb-4 text-center">Organize Tiers</Text>

      {/* Player Pool */}
      <View
        className="w-full bg-zinc-800 p-3 rounded-xl border border-zinc-700 min-h-[70px] flex-row flex-wrap gap-2 mb-6 relative"
        onLayout={event => {
          poolLayout.current = event.nativeEvent.layout;
        }}
      >
        {unassigned.map((player) => (
          <DraggablePlayer key={player.key} player={player} />
        ))}
      </View>

      {/* Tiers Table */}
      <View className="w-full space-y-4 pb-16">
        {tieredPlayers.map((tier, i) => {
          const displayTier = tierCount - i;
          return (
            <View
              key={i}
              className="flex-row items-start space-x-3"
              onLayout={event => {
                tierLayouts.current[i] = event.nativeEvent.layout;
              }}
            >
              <View className="w-6 items-center pt-2">
                <Text className="text-white font-bold text-lg">{displayTier}</Text>
              </View>

              <View className="flex-1 flex-row flex-wrap gap-2 bg-zinc-800 min-h-[60px] px-2 py-2 rounded-xl border border-zinc-700">
                {tier.length === 0 ? (
                  <Text className="text-gray-400 italic">Drop players here</Text>
                ) : (
                  tier.map((player) => (
                    <DraggablePlayer key={player.key} player={player} />
                  ))
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  floating: {
    width: width,
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'box-none',
  },
});
