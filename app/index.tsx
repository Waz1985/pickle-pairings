import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSessionStore } from "../src/core/sessionStore";

export default function HomeScreen() {
    const resetSession = useSessionStore((s) => s.resetSession);

    return (
        <View style={{ flex: 1, padding: 16, gap: 12, justifyContent: "center" }}>
            <Text style={{ fontSize: 26, fontWeight: "900", textAlign: "center" }}>
                Pickle Pairings
            </Text>

            <Pressable
                onPress={() => {
                    resetSession();
                    router.push("/mode");
                }}
                style={{ padding: 14, borderRadius: 12, backgroundColor: "black" }}
            >
                <Text style={{ color: "white", textAlign: "center", fontWeight: "800" }}>
                    Nuevo juego
                </Text>
            </Pressable>

            <Pressable
                onPress={() => router.push("/games/index")}
                style={{ padding: 14, borderRadius: 12, backgroundColor: "#444" }}
            >
                <Text style={{ color: "white", textAlign: "center", fontWeight: "800" }}>
                    Historial de juegos
                </Text>
            </Pressable>
        </View>
    );
}
