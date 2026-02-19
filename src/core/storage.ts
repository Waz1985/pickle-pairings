import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEY = "PB_SAVED_GAMES_V1";

export async function clearStorage(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function loadFromStorage<T>(fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveToStorage<T>(data: T): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
