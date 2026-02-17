import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Home() {
    return (
        <View style={{ flex: 1, justifyContent: "center", padding: 16, gap: 12 }}>
            <Text style={{ fontSize: 28, fontWeight: "800" }}>Pickle Pairings</Text>

            <Link href="/mode" asChild>
                <Pressable style={{ backgroundColor: "black", padding: 14, borderRadius: 12 }}>
                    <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
                        Nueva sesión
                    </Text>
                </Pressable>
            </Link>
        </View>
    );
}