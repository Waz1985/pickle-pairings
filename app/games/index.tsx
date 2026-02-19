import { router } from "expo-router";
import { useEffect } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSessionStore } from "../../src/core/sessionStore";

export default function GamesScreen() {
  const savedGames = useSessionStore((s) => s.savedGames);
  const loadSavedGames = useSessionStore((s) => s.loadSavedGames);

  useEffect(() => {
    loadSavedGames();
  }, [loadSavedGames]);

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "800" }}>Historial de juegos</Text>

      <FlatList
        data={savedGames ?? []}
        keyExtractor={(g) => g.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<Text style={{ opacity: 0.7 }}>No hay juegos guardados.</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({ pathname: "/games/[id]", params: { id: item.id } })
            }
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 12,
              padding: 12,
              gap: 4,
            }}
          >
            <Text style={{ fontWeight: "800" }}>{item.title}</Text>
            <Text style={{ opacity: 0.75 }}>Modo: {item.mode}</Text>
            <Text style={{ opacity: 0.75 }}>
              Rondas: {(item.rounds ?? []).length} | Canchas: {item.courts ?? 0}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}
