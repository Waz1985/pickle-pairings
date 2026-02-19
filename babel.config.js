module.exports = function (api) {
    api.cache(true);
    return {
        presets: ["babel-preset-expo"],
        plugins: [
            "expo-router/babel",
            // ✅ si tienes react-native-reanimated instalado (tú sí lo tienes),
            // este plugin debe ir SIEMPRE al final:
            "react-native-reanimated/plugin",
        ],
    };
};
