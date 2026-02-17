import { FlatList, Text, View } from "react-native";
import { useSessionStore } from "../src/core/sessionStore";
import { calculateStats } from "../src/engine/standings";

export default function StatsScreen() {
    const { players, rounds } = useSessionStore();
    const allMatches = rounds.flatMap(r => r.matches);
    const stats = calculateStats(players, allMatches);

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 16 }}>
                Tabla de Posiciones
            </Text>

            <FlatList
                data={stats}
                keyExtractor={(item) => item.playerId}
                renderItem={({ item, index }) => (
                    <View
                        style={{
                            padding: 12,
                            borderBottomWidth: 1,
                            borderColor: "#eee",
                        }}
                    >
                        <Text style={{ fontWeight: "700" }}>
                            {index + 1}. {item.name}
                        </Text>

                        <Text style={{ fontSize: 13 }}>
                            PJ: {item.played} | W: {item.wins} | L: {item.losses}
                        </Text>

                        <Text style={{ fontSize: 13 }}>
                            PF: {item.pointsFor} | PA: {item.pointsAgainst} | Diff: {item.diff}
                        </Text>

                        <Text style={{ fontSize: 13 }}>
                            Win%: {(item.winPct * 100).toFixed(0)}%
                        </Text>
                    </View>
                )}
            />
        </View>
    );
}
