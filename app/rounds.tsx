import { Link, router } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSessionStore } from "../src/core/sessionStore";
import type { Match, Player } from "../src/core/types";

function playerName(players: Player[], id: string) {
  return players.find((p) => p.id === id)?.name ?? "¿?";
}

export default function RoundsScreen() {
  const {
    players,
    rounds,
    currentRound,
    nextRound,
    prevRound,
    isFinished,
    finishGame,
    isReadOnly, // ✅ ahora viene del store dentro del componente
  } = useSessionStore();

  const safeRounds = rounds ?? [];
  const roundObj = safeRounds.find((r) => r.number === currentRound);
  const matches: Match[] = roundObj?.matches ?? [];
  const sitOutIds: string[] = roundObj?.sitOut ?? [];

  const sitOutNames =
    sitOutIds.length === 0
      ? "Nadie"
      : sitOutIds.map((id) => playerName(players, id)).join(", ");

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      {isReadOnly && (
        <Text style={{ color: "#B00020", fontWeight: "800" }}>
          Modo solo lectura
        </Text>
      )}

      <Text style={{ fontSize: 22, fontWeight: "800" }}>
        Ronda {currentRound} / {safeRounds.length}
      </Text>

      {/* Navegación de rondas */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable
          onPress={prevRound}
          disabled={currentRound === 1}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 12,
            backgroundColor: currentRound === 1 ? "#aaa" : "#444",
          }}
        >
          <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
            Anterior
          </Text>
        </Pressable>

        <Pressable
          onPress={nextRound}
          disabled={isFinished || isReadOnly} // ✅ bloquea si solo lectura
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 12,
            backgroundColor: isFinished || isReadOnly ? "#aaa" : "black",
          }}
        >
          <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
            Siguiente
          </Text>
        </Pressable>
      </View>

      {/* Acciones */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable
          onPress={() => router.push("/stats")}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 12,
            backgroundColor: "#444",
          }}
        >
          <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
            Estadísticas
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            finishGame();
            router.push("/stats");
          }}
          disabled={isFinished || isReadOnly} // ✅ bloquea si solo lectura
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 12,
            backgroundColor: isFinished || isReadOnly ? "#aaa" : "#B00020",
          }}
        >
          <Text style={{ color: "white", textAlign: "center", fontWeight: "800" }}>
            {isFinished ? "Finalizado" : "Finalizar"}
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={matches}
        keyExtractor={(m) => m.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={{ padding: 12, borderWidth: 1, borderColor: "#eee", borderRadius: 12 }}>
            <Text style={{ fontWeight: "700" }}>No hay partidos en esta ronda.</Text>
            <Text style={{ opacity: 0.75 }}>
              (Puede pasar si hay pocos jugadores activos / canchas.)
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const aIds = item?.teamA?.playerIds;
          const bIds = item?.teamB?.playerIds;

          if (!Array.isArray(aIds) || aIds.length < 2) return null;
          if (!Array.isArray(bIds) || bIds.length < 2) return null;

          const [a1, a2] = aIds;
          const [b1, b2] = bIds;

          return (
            <View
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 12,
                padding: 12,
                gap: 8,
              }}
            >
              <Text style={{ fontWeight: "800" }}>
                {playerName(players, a1)} / {playerName(players, a2)}
                {"  vs  "}
                {playerName(players, b1)} / {playerName(players, b2)}
              </Text>

              <Text style={{ opacity: 0.85 }}>
                {item.scoreA === null || item.scoreB === null
                  ? "Pendiente"
                  : `Marcador: ${item.scoreA} - ${item.scoreB}`}
              </Text>

              <Link
                href={{
                  pathname: "/match/[id]",
                  params: { id: item.id, round: String(currentRound) },
                }}
                asChild
              >
                <Pressable
                  style={{
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: "black",
                    opacity: isFinished || isReadOnly ? 0.6 : 1,
                  }}
                  disabled={isFinished || isReadOnly}
                >
                  <Text style={{ color: "white", textAlign: "center", fontWeight: "800" }}>
                    Ingresar marcador
                  </Text>
                </Pressable>
              </Link>
            </View>
          );
        }}
        ListFooterComponent={
          <View
            style={{
              marginTop: 14,
              padding: 12,
              borderWidth: 1,
              borderColor: "#eee",
              borderRadius: 12,
              backgroundColor: "white",
            }}
          >
            <Text style={{ fontWeight: "800", marginBottom: 6 }}>
              Fuera esta ronda (Sit-out)
            </Text>
            <Text style={{ opacity: 0.85 }}>{sitOutNames}</Text>
          </View>
        }
      />
    </View>
  );
}
