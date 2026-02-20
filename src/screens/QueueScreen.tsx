import React from "react";
import { View, Text, Pressable, FlatList, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useQueueStore } from "../store/useQueueStore";
import { usePlayerStore } from "../store/usePlayerStore";

export default function QueueScreen() {
  const navigation = useNavigation<any>();

  const { queue, moveUp, moveDown, removeFromQueue, clearQueue } =
    useQueueStore();

  const playTrack = usePlayerStore((s) => s.playTrack);
  const currentTrack = usePlayerStore((s) => s.currentTrack);

  const onRemove = async (trackId: string) => {
    if (currentTrack?.id === trackId) {
      Alert.alert(
        "Cannot remove",
        "This track is currently playing. Play another track first."
      );
      return;
    }
    await removeFromQueue(trackId);
  };

  const onClear = async () => {
    if (currentTrack) {
      Alert.alert(
        "Cannot clear",
        "A track is playing. Stop playback first or play something else."
      );
      return;
    }
    await clearQueue();
  };

  return (
    <View style={{ flex: 1, padding: 16, paddingBottom: 90 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={{ color: "blue" }}>Back</Text>
        </Pressable>

        <Pressable onPress={onClear}>
          <Text style={{ color: "red" }}>Clear</Text>
        </Pressable>
      </View>

      <Text style={{ fontSize: 22, fontWeight: "700", marginTop: 12 }}>
        Queue
      </Text>
      <Text style={{ opacity: 0.7, marginBottom: 12 }}>
        {queue.length} track(s)
      </Text>

      {queue.length === 0 ? (
        <Text style={{ marginTop: 30, opacity: 0.7 }}>
          Queue is empty. Add songs from Home.
        </Text>
      ) : (
        <FlatList
          data={queue}
          keyExtractor={(t) => t.id}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: "#eee" }} />
          )}
          renderItem={({ item, index }) => {
            const isCurrent = currentTrack?.id === item.id;

            return (
              <View
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  backgroundColor: isCurrent ? "#111" : "transparent",
                }}
              >
                <Pressable
                  onPress={async () => {
                    await playTrack(item);
                    navigation.navigate("Player");
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: isCurrent ? "white" : "black",
                    }}
                  >
                    {index + 1}. {item.title}
                  </Text>
                  <Text
                    style={{
                      opacity: 0.8,
                      marginTop: 2,
                      color: isCurrent ? "white" : "black",
                    }}
                  >
                    {item.artist}
                    {isCurrent ? "  •  Playing" : ""}
                  </Text>
                </Pressable>

                <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                  <Pressable
                    onPress={() => moveUp(index)}
                    disabled={index === 0}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      backgroundColor: index === 0 ? "#f3f3f3" : "#eee",
                      borderRadius: 8,
                      opacity: index === 0 ? 0.5 : 1,
                    }}
                  >
                    <Text>Up</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => moveDown(index)}
                    disabled={index === queue.length - 1}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      backgroundColor:
                        index === queue.length - 1 ? "#f3f3f3" : "#eee",
                      borderRadius: 8,
                      opacity: index === queue.length - 1 ? 0.5 : 1,
                    }}
                  >
                    <Text>Down</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => onRemove(item.id)}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      backgroundColor: "#ffdddd",
                      borderRadius: 8,
                    }}
                  >
                    <Text>Remove</Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}