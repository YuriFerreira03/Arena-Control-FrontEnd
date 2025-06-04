import React from "react";
import {
  Image,
  View,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput } from "react-native-paper";
import axios from "axios";

import { colors } from "../theme/colors";
import { API_URL } from "../config/api";

export default function LoginScreen({ navigation }: any) {
  // apenas login
  const loginSchema = yup.object({
    username: yup.string().required("Usuário é obrigatório"),
    senha: yup.string().min(6).required("Senha obrigatória"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      // Teste de conectividade genérico
      try {
        const teste = await fetch("https://www.google.com");
        console.log("Conectividade OK:", teste.status);
      } catch (e: any) {
        console.log("Falha de conexão geral:", e.message);
        // Se quiser, pode abortar aqui:
        // return;
      }

      // Chamada ao seu backend
      const res = await axios.post(`${API_URL}/auth/login`, data);
      await AsyncStorage.setItem("token", res.data.access_token);
      navigation.navigate("Home", { user: res.data.user });
    } catch (err: any) {
      console.log("Erro completo:", err);
      console.log("Status erro:", err.response?.status);
      console.log("Corpo erro:", err.response?.data);
      alert("Erro: " + (err.response?.data?.message || "Erro desconhecido"));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "android" ? "height" : "padding"}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <Image
          source={require("../../assets/logoHD.png")}
          style={styles.logo}
        />
        <Text style={styles.brand}>
          <Text style={styles.brandLeft}>Arena</Text>
          <Text style={styles.brandRight}>Control</Text>
        </Text>

        <View style={styles.card}>
          {/* Usuário */}
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Usuário"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                error={!!errors.username}
                style={styles.input}
                outlineStyle={{ borderWidth: 2 }}
                selectionColor={colors.text}
              />
            )}
          />
          {errors.username && (
            <Text style={styles.error}>{errors.username.message}</Text>
          )}

          {/* Senha */}
          <Controller
            control={control}
            name="senha"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Senha"
                mode="outlined"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                error={!!errors.senha}
                style={styles.input}
                outlineStyle={{ borderWidth: 2 }}
                selectionColor={colors.text}
              />
            )}
          />
          {errors.senha && (
            <Text style={styles.error}>{errors.senha.message}</Text>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.credits}>© 2025 Yuri Ferreira</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  logo: {
    width: 280,
    height: 280,
    resizeMode: "contain",
    marginBottom: 0,
    marginTop: -160,
  },
  card: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
    elevation: 6,
  },
  input: {
    backgroundColor: colors.white,
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: colors.white, fontSize: 18 },
  link: {
    color: colors.primary,
    textAlign: "center",
    marginTop: 16,
    fontSize: 15,
    fontWeight: "bold",
  },
  error: { color: "red", fontSize: 12, marginBottom: 4 },
  brand: {
    fontSize: 38, // grande e chamativo
    letterSpacing: 1, // lembra dígitos de placar
    fontFamily: "monospace",
    marginBottom: 16,
    fontWeight: "bold",
    marginTop: -40,
    textAlign: "center",
  },
  brandLeft: {
    color: "#FFFFFF", // parte “Arena” em branco (placa clara)
    textShadowColor: "#002B55",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  brandRight: {
    color: "#C8FF57", // parte “Control” no verde-limão
    textShadowColor: "#044B97",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  brandSmall: {
    fontSize: 35,
    marginTop: -30,
    marginBottom: 8,
  },
  credits: {
    textAlign: "center",
    color: "#eee",
    fontSize: 12,
    marginBottom: 20,
    marginTop: 5,
  },
});
