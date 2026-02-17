import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSessionStore } from "../../src/core/sessionStore";
import type { Match } from "../../src/core/types";

export default function MatchScreen() {
    const params = useLocalSearchParams<{ id?: string; round?: string }>();

    const id = params.id ?? "";
    const roundNumber = Number(params.round ?? "1");

    const { rounds, players, updateScore } = useSessionStore();

    // 🔥 Buscar correctamente el match dentro de la ronda
    const match: Match | undefined = useMemo(() => {
        const r = rounds.find((r) => r.number === roundNumber);
        if (!r) return undefined;
        return r.matches.find((m) => m.id === id);
    }, [rounds, roundNumber, id]);

    const [scoreA, setScoreA] = useState("");
    const [scoreB, setScoreB] = useState("");

    if (!match) {
        return (
            <View style={{ flex: 1, padding: 16 }}>
                <Text>
                    No se encontró el partido (id: {id}) en la ronda {roundNumber}
                </Text>
                <Pressable
                    onPress={() => router.back()}
                    style={{
                        marginTop: 20,
                        padding: 12,
                        borderRadius: 12,
                        backgroundColor: "black",
                    }}
                >
                    <Text style={{ color: "white", textAlign: "center" }}>
                        Volver
                    </Text>
                </Pressable>
            </View>
        );
    }

    const [a1, a2] = match.teamA.playerIds;
    const [b1, b2] = match.teamB.playerIds;

    function playerName(pid: string) {
        return players.find((p) => p.id === pid)?.name ?? "¿?";
    }

    function save() {
        const a = Number(scoreA);
        const b = Number(scoreB);

        if (!Number.isFinite(a) || !Number.isFinite(b)) return;

        // 🔥 Ahora usamos el id del parámetro (más seguro)
        updateScore(roundNumber, id, a, b);
        router.back();
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <ScrollView
                contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 120 }}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={{ fontSize: 18, fontWeight: "800" }}>
                    Ronda {roundNumber}
                </Text>

                <Text style={{ fontWeight: "700" }}>
                    {playerName(a1)} / {playerName(a2)} vs {playerName(b1)} / {playerName(b2)}
                </Text>

                <TextInput
                    value={scoreA}
                    onChangeText={setScoreA}
                    keyboardType="number-pad"
                    placeholder={match.scoreA?.toString() ?? "0"}
                    style={{
                        borderWidth: 1,
                        borderColor: "#ccc",
                        padding: 12,
                        borderRadius: 12,
                    }}
                />

                <TextInput
                    value={scoreB}
                    onChangeText={setScoreB}
                    keyboardType="number-pad"
                    placeholder={match.scoreB?.toString() ?? "0"}
                    style={{
                        borderWidth: 1,
                        borderColor: "#ccc",
                        padding: 12,
                        borderRadius: 12,
                    }}
                />
            </ScrollView>

            <View
                style={{
                    padding: 16,
                    borderTopWidth: 1,
                    borderTopColor: "#eee",
                    backgroundColor: "white",
                }}
            >
                <Pressable
                    onPress={save}
                    style={{
                        padding: 14,
                        borderRadius: 12,
                        backgroundColor: "black",
                    }}
                >
                    <Text style={{ color: "white", textAlign: "center", fontWeight: "800" }}>
                        Guardar marcador
                    </Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}
