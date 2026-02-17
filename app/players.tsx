import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSessionStore } from "../src/core/sessionStore";
import type { Mode, Player } from "../src/core/types";

function makeId(prefix: string) {
    return `${prefix}_${Math.random().toString(16).slice(2)}`;
}

export default function PlayersScreen() {
    const params = useLocalSearchParams<{ mode: Mode; count: string }>();

    const mode = (params.mode ?? "random") as Mode;
    const count = Number(params.count ?? "8");

    const startSession = useSessionStore((s) => s.startSession);

    const initialNames = useMemo(
        () => Array.from({ length: count }, () => ""),
        [count]
    );

    const [names, setNames] = useState<string[]>(initialNames);

    function updateName(index: number, value: string) {
        setNames((prev) =>
            prev.map((name, i) => (i === index ? value : name))
        );
    }

    function buildPlayers(): Player[] {
        return names.map((name, i) => ({
            id: makeId("p"),
            name: name.trim() || `Jugador ${i + 1}`,
        }));
    }

    function handleContinue() {
        const players = buildPlayers();

        startSession(mode, players);

        router.push("/rounds");
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                contentContainerStyle={{
                    padding: 16,
                    gap: 12,
                }}
            >
                <Text style={{ fontSize: 22, fontWeight: "700" }}>
                    Ingresar jugadores ({count})
                </Text>

                <Text style={{ opacity: 0.7 }}>
                    Modo: {mode === "random" ? "Aleatorio por ronda" : "Parejas fijas"}
                </Text>

                {names.map((value, i) => (
                    <TextInput
                        key={i}
                        value={value}
                        onChangeText={(text) => updateName(i, text)}
                        placeholder={`Jugador ${i + 1}`}
                        style={{
                            borderWidth: 1,
                            borderColor: "#ccc",
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            fontSize: 16,
                        }}
                    />
                ))}

                <Pressable
                    onPress={handleContinue}
                    style={{
                        marginTop: 20,
                        padding: 14,
                        borderRadius: 12,
                        backgroundColor: "black",
                    }}
                >
                    <Text
                        style={{
                            color: "white",
                            textAlign: "center",
                            fontWeight: "700",
                            fontSize: 16,
                        }}
                    >
                        Generar ronda
                    </Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}
