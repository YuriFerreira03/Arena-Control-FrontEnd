// src/components/Header.tsx
import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

export default function Header() {
  const { width } = useWindowDimensions();
  const logoSize = Math.min(90, width * 0.9);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/logoHD.png")}
        style={[styles.logo, { width: logoSize, height: logoSize }]}
      />

      {/* Texto com duas cores e sombra */}
      <Text style={styles.brand}>
        <Text style={styles.brandLeft}>Arena</Text>
        <Text style={styles.brandRight}>Control</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#003366",
  },
  logo: {
    resizeMode: "contain",
  },

  // novo estilo aninhado
  brand: {
    fontSize: 30, // grande e chamativo
    letterSpacing: 1, // lembra dígitos de placar
    fontFamily: "monospace",
    marginBottom: 16,
    marginTop: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  brandLeft: {
    color: "#FFFFFF", // “Arena” em branco
    textShadowColor: "#002B55",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  brandRight: {
    color: "#C8FF57", // “Control” em verde-limão
    textShadowColor: "#044B97",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
});
