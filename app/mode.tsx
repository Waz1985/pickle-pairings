import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { Mode } from "../src/core/types";

const sizes = [4, 8, 12, 16] as const;

export default function ModeScreen() {
    const [mode, setMode] = useState<Mode>("random");
    const [count, setCount] = useState<(typeof sizes)[number]>(8);

    return (
        <View style={{ flex: 1, padding: 16, gap: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: "700" }}>Configurar sesión</Text>

            <View style={{ gap: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: "600" }}>Modo</Text>

                <Pressable
                    onPress={() => setMode("random")}
                    style={{
                        padding: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: mode === "random" ? "black" : "#ccc",
                    }}
                >
                    <Text style={{ fontWeight: "700" }}>Aleatorio por ronda</Text>
                    <Text style={{ opacity: 0.7 }}>Cambia parejas cada ronda, stats individuales.</Text>
                </Pressable>

                <Pressable
                    onPress={() => setMode("fixed")}
                    style={{
                        padding: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: mode === "fixed" ? "black" : "#ccc",
                    }}
                >
                    <Text style={{ fontWeight: "700" }}>Parejas fijas</Text>
                    <Text style={{ opacity: 0.7 }}>Round robin entre parejas, stats por pareja.</Text>
                </Pressable>
            </View>

            <View style={{ gap: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: "600" }}>Cantidad de jugadores</Text>
                <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                    {sizes.map((n) => (
                        <Pressable
                            key={n}
                            onPress={() => setCount(n)}
                            style={{
                                paddingVertical: 10,
                                paddingHorizontal: 14,
                                borderRadius: 999,
                                borderWidth: 1,
                                borderColor: count === n ? "black" : "#ccc",
                            }}
                        >
                            <Text style={{ fontWeight: "700" }}>{n}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            <Pressable
                onPress={() => {
                    router.push({
                        pathname: "/players",
                        params: { mode, count: String(count) },
                    });
                }}
                style={{
                    marginTop: "auto",
                    padding: 14,
                    borderRadius: 12,
                    backgroundColor: "black",
                }}
            >
                <Text style={{ color: "white", textAlign: "center", fontWeight: "800" }}>
                    Siguiente
                </Text>
            </Pressable>
        </View>
    );
}
