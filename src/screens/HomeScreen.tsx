import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { searchSongs } from "../services/saavnApi";
import { normalizeSongToTrack } from "../utils/normalize";
import { usePlayerStore } from "../store/usePlayerStore";
import { useQueueStore } from "../store/useQueueStore";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const playTrack = usePlayerStore((s) => s.playTrack);
  const ensureInQueue = useQueueStore((s) => s.ensureInQueue);
  const queue = useQueueStore((s) => s.queue);

  const [query, setQuery] = useState("arijit");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canLoadMore = useMemo(() => items.length < total, [items.length, total]);

  const load = async (opts: { reset: boolean }) => {
    const q = query.trim();
    if (!q) return;

    // prevent duplicate calls
    if (loading || loadingMore) return;

    try {
      opts.reset ? setLoading(true) : setLoadingMore(true);
      setError(null);

      const nextPage = opts.reset ? 1 : page + 1;
      const { results, total } = await searchSongs(q, nextPage);

      setTotal(total);
      setPage(nextPage);
      setItems((prev) => (opts.reset ? results : [...prev, ...results]));
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      if (msg.includes("429")) {
        setError("Too many requests. Wait 10 seconds and try again.");
      } else {
        setError("Search failed. Try again.");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onPlay = async (track: any) => {
    if (!track.url) {
      Alert.alert("Unavailable", "No playable URL.");
      return;
    }

    await ensureInQueue(track);
    await playTrack(track);
    navigation.navigate("Player");
  };

  return (
    <View style={{ flex: 1, padding: 16, paddingBottom: 90 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>Saavn Music</Text>

        <Pressable
          onPress={() => navigation.navigate("Queue")}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 8,
            backgroundColor: "#111",
          }}
        >
          <Text style={{ color: "white" }}>Queue ({queue.length})</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", gap: 8, marginVertical: 12 }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search songs"
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ddd",
            padding: 10,
            borderRadius: 8,
          }}
          onSubmitEditing={() => load({ reset: true })}
          returnKeyType="search"
        />

        <Pressable
          onPress={() => load({ reset: true })}
          style={{
            paddingHorizontal: 14,
            justifyContent: "center",
            borderRadius: 8,
            backgroundColor: "#111",
          }}
        >
          <Text style={{ color: "white" }}>Search</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator />
      ) : error ? (
        <Text style={{ color: "red" }}>{error}</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: "#eee" }} />
          )}
          renderItem={({ item }) => {
            const track = normalizeSongToTrack(item);
            const disabled = !track.url;

            return (
              <Pressable
                onPress={() => onPlay(track)}
                disabled={disabled}
                style={{ paddingVertical: 12, opacity: disabled ? 0.5 : 1 }}
              >
                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                  {track.title}
                </Text>
                <Text style={{ opacity: 0.7 }}>{track.artist}</Text>
              </Pressable>
            );
          }}
          // onEndReached={() => {
          //   if (!loadingMore && canLoadMore) load({ reset: false });
          // }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() =>
            loadingMore ? (
              <View style={{ paddingVertical: 16 }}>
                <ActivityIndicator />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}