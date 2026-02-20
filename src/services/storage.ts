import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "SAAVN_QUEUE_V1";

export async function saveQueue(raw: any) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(raw));
}

export async function loadQueue<T>(): Promise<T | null> {
  const v = await AsyncStorage.getItem(QUEUE_KEY);
  if (!v) return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
}