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
    } = useSessionStore();

    const roundObj = rounds.find((r) => r.number === currentRound);
    const matches: Match[] = roundObj?.matches ?? [];

    return (
        <View style={{ flex: 1, padding: 16, gap: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: "700" }}>
                Ronda {currentRound} / {rounds.length}
            </Text>

            {/* Navegación de rondas */}
            <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                    onPress={prevRound}
                    style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 12,
                        backgroundColor: currentRound === 1 ? "#aaa" : "#444",
                    }}
                    disabled={currentRound === 1}
                >
                    <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
                        Ronda anterior
                    </Text>
                </Pressable>

                <Pressable
                    onPress={nextRound}
                    style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 12,
                        backgroundColor: isFinished ? "#aaa" : "black",
                    }}
                    disabled={isFinished}
                >
                    <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
                        Siguiente ronda
                    </Text>
                </Pressable>
            </View>

            {/* Stats siempre acumuladas */}
            <Pressable
                onPress={() => router.push("/stats")}
                style={{ padding: 12, borderRadius: 12, backgroundColor: "#444" }}
            >
                <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
                    Ver estadísticas (acumuladas)
                </Text>
            </Pressable>

            {/* Finalizar juego */}
            <Pressable
                onPress={() => {
                    finishGame();
                    router.push("/stats");
                }}
                style={{
                    padding: 12,
                    borderRadius: 12,
                    backgroundColor: isFinished ? "#aaa" : "#B00020",
                }}
                disabled={isFinished}
            >
                <Text style={{ color: "white", textAlign: "center", fontWeight: "800" }}>
                    {isFinished ? "Juego finalizado" : "Finalizar juego"}
                </Text>
            </Pressable>

            <FlatList
                data={matches}
                keyExtractor={(m) => m.id}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                renderItem={({ item }) => {
                    const [a1, a2] = item.teamA.playerIds;
                    const [b1, b2] = item.teamB.playerIds;

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
                            <Text style={{ fontWeight: "700" }}>
                                {playerName(players, a1)} / {playerName(players, a2)}
                                {"  vs  "}
                                {playerName(players, b1)} / {playerName(players, b2)}
                            </Text>

                            <Text>
                                {item.scoreA === null || item.scoreB === null
                                    ? "Pendiente"
                                    : `${item.scoreA} - ${item.scoreB}`}
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
                                    }}
                                >
                                    <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
                                        Ingresar marcador
                                    </Text>
                                </Pressable>
                            </Link>
                        </View>
                    );
                }}
            />
        </View>
    );
}
