import React, { useMemo, useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import Slider from "@react-native-community/slider";
import { useNavigation } from "@react-navigation/native";
import { usePlayerStore } from "../store/usePlayerStore";
import { useQueueStore } from "../store/useQueueStore";

const formatTime = (millis: number) => {
  const safe = Math.max(0, millis || 0);
  const totalSeconds = Math.floor(safe / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export default function PlayerScreen() {
  const navigation = useNavigation<any>();

  const {
    currentTrack,
    isPlaying,
    pause,
    resume,
    position,
    duration,
    seek,
    skipBackward,
    skipForward,
    playPrev,
    playNext,
  } = usePlayerStore();

  const queue = useQueueStore((s) => s.queue);

  // Slider UX: keep a local value while user drags, commit on release
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  const max = useMemo(() => Math.max(1, duration || 1), [duration]);
  const sliderValue = isSeeking ? seekValue : position;

  const currentIndex = useMemo(() => {
    if (!currentTrack) return -1;
    return queue.findIndex((t) => t.id === currentTrack.id);
  }, [queue, currentTrack]);

  const canPrev = currentIndex > 0;
  const canNext = currentIndex !== -1 && currentIndex < queue.length - 1;

  if (!currentTrack) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No track playing</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={{ marginTop: 10, color: "blue" }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const btn = (disabled?: boolean) => ({
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: disabled ? "#f1f1f1" : "#eee",
    opacity: disabled ? 0.5 : 1,
    minWidth: 60,
    alignItems: "center" as const,
  });

  return (
    <View style={{ flex: 1, padding: 20, paddingTop: 50 }}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={{ color: "blue" }}>Back</Text>
      </Pressable>

      <Text style={{ fontSize: 22, fontWeight: "700", marginTop: 20 }}>
        {currentTrack.title}
      </Text>
      <Text style={{ opacity: 0.7, marginTop: 4 }}>{currentTrack.artist}</Text>

      <View style={{ marginTop: 28, padding: 14, borderRadius: 16, backgroundColor: "#fafafa" }}>
        <Slider
          minimumValue={0}
          maximumValue={max}
          value={Math.min(sliderValue, max)}
          onSlidingStart={() => {
            setIsSeeking(true);
            setSeekValue(position);
          }}
          onValueChange={(val) => setSeekValue(val)}
          onSlidingComplete={async (val) => {
            setIsSeeking(false);
            await seek(val);
          }}
        />

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text>{formatTime(sliderValue)}</Text>
          <Text>{formatTime(duration)}</Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 28,
          gap: 10,
        }}
      >
        <Pressable
          onPress={async () => {
            if (!canPrev) {
              Alert.alert("Start of queue", "No previous track.");
              return;
            }
            await playPrev();
          }}
          style={btn(!canPrev)}
        >
          <Text>Prev</Text>
        </Pressable>

        <Pressable onPress={skipBackward} style={btn(false)}>
          <Text>{"-10s"}</Text>
        </Pressable>

        <Pressable
          onPress={() => (isPlaying ? pause() : resume())}
          style={{
            ...btn(false),
            backgroundColor: "#111",
          }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>
            {isPlaying ? "Pause" : "Play"}
          </Text>
        </Pressable>

        <Pressable onPress={skipForward} style={btn(false)}>
          <Text>{"+10s"}</Text>
        </Pressable>

        <Pressable
          onPress={async () => {
            if (!canNext) {
              Alert.alert("End of queue", "No next track.");
              return;
            }
            await playNext();
          }}
          style={btn(!canNext)}
        >
          <Text>Next</Text>
        </Pressable>
      </View>

      <View style={{ marginTop: 18, opacity: 0.7 }}>
        <Text>
          Queue: {currentIndex === -1 ? "—" : `${currentIndex + 1} / ${queue.length}`}
        </Text>
      </View>
    </View>
  );
}