import React from "react";
import { View, Text, Pressable } from "react-native";
import Slider from "@react-native-community/slider";
import { useNavigation } from "@react-navigation/native";

import { usePlayerStore } from "../store/usePlayerStore";

export default function MiniPlayer() {
  const navigation = useNavigation<any>();
  const { currentTrack, isPlaying, pause, resume, position, duration, seek } =
    usePlayerStore();

  if (!currentTrack) return null;

  return (
    <Pressable
      onPress={() => navigation.navigate("Player")}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: 12,
        borderTopWidth: 1,
        backgroundColor: "#111",
      }}
    >
      <Text style={{ color: "white", fontWeight: "600" }}>
        {currentTrack.title} • {currentTrack.artist}
      </Text>

      <Slider
        minimumValue={0}
        maximumValue={duration || 1}
        value={position}
        onSlidingComplete={seek}
      />

      <Pressable
        onPress={() => (isPlaying ? pause() : resume())}
        style={{
          alignSelf: "flex-end",
          paddingVertical: 6,
          paddingHorizontal: 12,
          backgroundColor: "#222",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white" }}>{isPlaying ? "Pause" : "Play"}</Text>
      </Pressable>
    </Pressable>
  );
}