import React, { useEffect, useRef, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Audio } from "expo-av";
import { View, ActivityIndicator } from "react-native";

import RootNavigator from "./src/navigation/RootNavigator";
import MiniPlayer from "./src/components/MiniPlayer";
import { useQueueStore } from "./src/store/useQueueStore";

export default function App() {
  const hydrateQueue = useQueueStore((s) => s.hydrate);
  const hydrated = useQueueStore((s) => s.hydrated);

  const didInit = useRef(false);
  const [audioReady, setAudioReady] = useState(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    (async () => {
      try {
        await hydrateQueue();

        await Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } finally {
        setAudioReady(true);
      }
    })();
  }, [hydrateQueue]);

  // optional: tiny loader to avoid race conditions + looks professional
  if (!hydrated || !audioReady) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <View style={{ flex: 1 }}>
          <RootNavigator />
          <MiniPlayer />
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}