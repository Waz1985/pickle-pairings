import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { useSessionStore } from "../../src/core/sessionStore";

export default function OpenGameScreen() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const openSavedGame = useSessionStore((s) => s.openSavedGame);

    useEffect(() => {
        if (!id) return;

        (async () => {
            await openSavedGame(id);
            router.replace("/rounds");
        })();
    }, [id, openSavedGame]);

    return (
        <View style={{ flex: 1, padding: 16, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>Abriendo juego...</Text>
        </View>
    );
}
