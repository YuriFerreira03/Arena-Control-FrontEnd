import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { TextInput, Checkbox } from "react-native-paper";
import axios from "axios";

import { colors } from "../theme/colors";
import { API_URL } from "../config/api";

const signupSchema = yup.object({
  username: yup.string().required("Usuário é obrigatório"),
  senha: yup.string().min(6).required("Senha obrigatória"),
  matricula: yup.string().required("Matrícula obrigatória"),
  email: yup.string().email().required("Email obrigatório"),
  telefone: yup.string().required("Telefone obrigatório"),
  e_adm: yup.boolean().default(false),
});

export default function AdmCadastroScreen({ navigation }: any) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(signupSchema),
    defaultValues: { e_adm: false },
  });

  const onSubmit = async (data: any) => {
    try {
      await axios.post(`${API_URL}/auth/register`, data, {
        headers: { "Content-Type": "application/json;charset=utf-8" },
      });
      alert("Usuário cadastrado com sucesso!");
      reset(); // limpa o formulário
      navigation.goBack(); // ou mantenha, se preferir
    } catch (err: any) {
      alert("Erro: " + (err?.response?.data?.message || "Erro desconhecido"));
    }
  };
  const handleBack = () => navigation.goBack();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastro de Novos Usuário</Text>

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
      {errors.senha && <Text style={styles.error}>{errors.senha.message}</Text>}

      {/* Matrícula */}
      <Controller
        control={control}
        name="matricula"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Matrícula"
            mode="outlined"
            value={value}
            onChangeText={onChange}
            error={!!errors.matricula}
            style={styles.input}
            outlineStyle={{ borderWidth: 2 }}
            selectionColor={colors.text}
          />
        )}
      />
      {errors.matricula && (
        <Text style={styles.error}>{errors.matricula.message}</Text>
      )}

      {/* Email */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Email"
            mode="outlined"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
            error={!!errors.email}
            style={styles.input}
            outlineStyle={{ borderWidth: 2 }}
            selectionColor={colors.text}
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      {/* Telefone */}
      <Controller
        control={control}
        name="telefone"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Telefone"
            mode="outlined"
            keyboardType="phone-pad"
            value={value}
            onChangeText={onChange}
            error={!!errors.telefone}
            style={styles.input}
            outlineStyle={{ borderWidth: 2 }}
            selectionColor={colors.text}
          />
        )}
      />
      {errors.telefone && (
        <Text style={styles.error}>{errors.telefone.message}</Text>
      )}

      {/* Checkbox */}
      <Controller
        control={control}
        name="e_adm"
        render={({ field: { onChange, value } }) => (
          <Checkbox.Item
            label="Administrador?"
            //colocar o adminstrador perto do checkbox
            style={{
              marginBottom: 12,
              marginTop: 8,
            }}
            status={value ? "checked" : "unchecked"}
            onPress={() => onChange(!value)}
            position="leading"
            labelStyle={{ color: colors.primary }}
          />
        )}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? "Salvando..." : "Cadastrar"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={handleBack} // ⬅️  sem handleSubmit
        disabled={isSubmitting} // opcional: desabilita só durante salvamento
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? "Voltando..." : "Voltar"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: colors.primary,
    textAlign: "center",
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
  //stilo para label adminstrador
  checkboxLabel: {
    color: colors.primary,
    fontSize: 16,
    marginLeft: 8,
  },
  buttonText: { color: colors.accent, fontSize: 18 },
  error: { color: "red", fontSize: 12, marginBottom: 4 },
});
