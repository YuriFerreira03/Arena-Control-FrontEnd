// src/components/HomeButton.tsx

import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

interface HomeButtonProps {
  navigation: { navigate: (screen: string) => void };
}

export default function HomeButton({ navigation }: HomeButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate("Home")}
    >
      <Text style={styles.text}>Voltar para Home</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
