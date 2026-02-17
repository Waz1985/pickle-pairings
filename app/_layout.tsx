import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack screenOptions={{ headerTitleAlign: "center" }}>
            <Stack.Screen name="index" options={{ title: "Pickle Pairings" }} />
            <Stack.Screen name="mode" options={{ title: "Configurar" }} />
            <Stack.Screen name="players" options={{ title: "Jugadores" }} />
            <Stack.Screen name="rounds" options={{ title: "Rondas" }} />
            <Stack.Screen name="fixed-pairs" options={{ title: "Parejas" }} />
            <Stack.Screen name="stats" options={{ title: "Estadísticas" }} />
            <Stack.Screen name="match/[id]" options={{ title: "Marcador" }} />
        </Stack>
    );
}
