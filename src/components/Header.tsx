import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

export default function Header() {
  const { width, height } = useWindowDimensions();
  const logoSize = Math.min(80, width * 0.18); // 18% da largura até no máx 90
  const paddingHorizontal = width * 0.05;
  const paddingVertical = height * 0.015;
  const fontSize = Math.min(30, width * 0.08);

  return (
    <View style={[styles.container, { paddingHorizontal, paddingVertical }]}>
      <Image
        source={require("../../assets/logoHD.png")}
        style={[styles.logo, { width: logoSize, height: logoSize }]}
      />

      <Text style={[styles.brand, { fontSize }]}>
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
    backgroundColor: "#003366",
  },
  logo: {
    resizeMode: "contain",
  },
  brand: {
    letterSpacing: 1,
    fontFamily: "monospace",
    marginBottom: 16,
    marginTop: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  brandLeft: {
    color: "#FFFFFF",
    textShadowColor: "#002B55",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  brandRight: {
    color: "#C8FF57",
    textShadowColor: "#044B97",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
});
