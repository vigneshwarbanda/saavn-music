import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import PlayerScreen from "../screens/PlayerScreen";
import QueueScreen from "../screens/QueueScreen";

export type RootStackParamList = {
  Home: undefined;
  Player: undefined;
  Queue: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Player" component={PlayerScreen} />
      <Stack.Screen name="Queue" component={QueueScreen} />
    </Stack.Navigator>
  );
}