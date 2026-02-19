import { FlatList, Text, View } from "react-native";
import { useSessionStore } from "../src/core/sessionStore";
import type { Player } from "../src/core/types";
import { calculateStats } from "../src/engine/standings";

function sitOutSummary(players: Player[], rounds: any[]) {
  const totals: Record<string, number> = {};

  for (const r of rounds) {
    for (const pid of r.sitOut ?? []) {
      totals[pid] = (totals[pid] ?? 0) + 1;
    }
  }

  return players
    .map((p) => ({
      playerId: p.id,
      name: p.name,
      sitOut: totals[p.id] ?? 0,
    }))
    .sort((a, b) => b.sitOut - a.sitOut);
}

export default function StatsScreen() {
  const { players, rounds, isFinished } = useSessionStore();

  const allMatches = (rounds ?? []).flatMap(r => r.matches ?? []);
  const stats = calculateStats(players, allMatches);
  const sitOut = sitOutSummary(players, rounds);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={stats}
        keyExtractor={(item) => item.playerId}
        ListHeaderComponent={
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: "800" }}>
              {isFinished ? "Resultados finales" : "Resultados parciales"}
            </Text>

            <Text style={{ fontSize: 18, fontWeight: "800", marginTop: 12 }}>
              Tabla de posiciones
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View
            style={{
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderColor: "#eee",
              gap: 3,
            }}
          >
            <Text style={{ fontWeight: "800" }}>
              {index + 1}. {item.name}
            </Text>
            <Text style={{ opacity: 0.8 }}>
              PJ {item.played} | W {item.wins} | L {item.losses} | Diff {item.diff}
            </Text>
            <Text style={{ opacity: 0.8 }}>
              PF {item.pointsFor} | PA {item.pointsAgainst} | Win%{" "}
              {(item.winPct * 100).toFixed(0)}%
            </Text>
          </View>
        )}
        ListFooterComponent={
          isFinished ? (
            <View
              style={{
                marginTop: 20,
                paddingTop: 14,
                borderTopWidth: 1,
                borderTopColor: "#eee",
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 6 }}>
                Sit-out total por jugador
              </Text>

              {sitOut.map((x) => (
                <View
                  key={x.playerId}
                  style={{
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderColor: "#f0f0f0",
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>
                    {x.name}: {x.sitOut} veces
                  </Text>
                </View>
              ))}
            </View>
          ) : null
        }
      />
    </View>
  );
}
