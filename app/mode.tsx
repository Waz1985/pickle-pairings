import { router } from "expo-router";
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
import type { Mode } from "../src/core/types";

export default function ModeScreen() {
  const [mode, setMode] = useState<Mode>("random");

  const [countText, setCountText] = useState("8");
  const [courtsText, setCourtsText] = useState("2");

  const count = useMemo(() => Math.max(0, Math.floor(Number(countText || "0"))), [countText]);
  const courts = useMemo(() => Math.max(0, Math.floor(Number(courtsText || "0"))), [courtsText]);

  const isCountValid = count >= 4;
  const isCourtsValid = courts >= 1;

  const activePerRound = isCourtsValid ? courts * 4 : 0;
  const sitOutPerRound = isCountValid && isCourtsValid ? Math.max(0, count - activePerRound) : 0;

  const canContinue = isCountValid && isCourtsValid;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 22, fontWeight: "800" }}>Configurar sesión</Text>

        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: "700" }}>Modo</Text>

          <Pressable
            onPress={() => setMode("random")}
            style={{
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: mode === "random" ? "black" : "#ccc",
            }}
          >
            <Text style={{ fontWeight: "800" }}>Aleatorio por ronda</Text>
            <Text style={{ opacity: 0.7 }}>
              Cambia parejas cada ronda, stats individuales, sit-out automático.
            </Text>
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
            <Text style={{ fontWeight: "800" }}>Parejas fijas</Text>
            <Text style={{ opacity: 0.7 }}>
              Round robin entre parejas (lo activamos después).
            </Text>
          </Pressable>
        </View>

        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: "700" }}>Cantidad de jugadores</Text>
          <TextInput
            value={countText}
            onChangeText={setCountText}
            keyboardType="number-pad"
            placeholder="Ej: 6, 10, 14..."
            returnKeyType="done"
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 16,
            }}
          />
          {!isCountValid && <Text style={{ color: "#B00020" }}>Mínimo 4 jugadores.</Text>}
        </View>

        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: "700" }}>Canchas disponibles</Text>
          <TextInput
            value={courtsText}
            onChangeText={setCourtsText}
            keyboardType="number-pad"
            placeholder="Ej: 1, 2, 3..."
            returnKeyType="done"
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 16,
            }}
          />
          {!isCourtsValid && <Text style={{ color: "#B00020" }}>Mínimo 1 cancha.</Text>}
        </View>

        <View
          style={{
            gap: 6,
            padding: 12,
            borderWidth: 1,
            borderColor: "#eee",
            borderRadius: 12,
          }}
        >
          <Text style={{ fontWeight: "800" }}>Resumen</Text>
          <Text style={{ opacity: 0.75 }}>Jugadores activos por ronda: {activePerRound || 0}</Text>
          <Text style={{ opacity: 0.75 }}>Sit-out por ronda (aprox): {sitOutPerRound}</Text>
          <Text style={{ opacity: 0.75 }}>(Cada cancha usa 4 jugadores)</Text>
        </View>
      </ScrollView>

      {/* ✅ Barra fija abajo: siempre tocable aunque esté el teclado */}
      <View
        style={{
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: "#eee",
          backgroundColor: "white",
        }}
      >
        <Pressable
          onPress={() => {
            if (!canContinue) return;
            router.push({
              pathname: "/players",
              params: {
                mode,
                count: String(count),
                courts: String(courts),
              },
            });
          }}
          disabled={!canContinue}
          style={{
            padding: 14,
            borderRadius: 12,
            backgroundColor: canContinue ? "black" : "#aaa",
          }}
        >
          <Text style={{ color: "white", textAlign: "center", fontWeight: "800" }}>
            Siguiente
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
