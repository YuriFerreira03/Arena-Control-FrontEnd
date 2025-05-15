// src/screens/AdmCadastroScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { TextInput, Checkbox } from "react-native-paper";
import API from "../service/api";
import { colors } from "../theme/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";


const signupSchema = yup.object({
  username: yup.string().required("Usuário é obrigatório"),
  senha: yup
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .required("Senha obrigatória"),
  matricula: yup.string().required("Matrícula obrigatória"),
  email: yup.string().email("E-mail inválido").required("E-mail obrigatório"),
  telefone: yup.string().required("Telefone obrigatório"),
  e_adm: yup.boolean(),
});

type FormData = {
  username: string;
  senha: string;
  matricula: string;
  email: string;
  telefone: string;
  e_adm: boolean;
};

export default function AdmCadastroScreen({ navigation }: any) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      username: "",
      senha: "",
      matricula: "",
      email: "",
      telefone: "",
      e_adm: false,
    },
  });

  const [users, setUsers] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Carrega quem eu criei
  const loadUsers = async () => {
    try {
      console.log("GET /usuario/created");
      const res = await API.get("/usuario/created");
      console.log("Usuários carregados:", res.data);
      setUsers(res.data);
    } catch {
      console.error("Erro ao carregar usuários:", err?.response?.data || err.message);
      Alert.alert("Erro", "Não foi possível carregar usuários.");
    }
  };

useEffect(() => {
  const initialize = async () => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      console.log("Token carregado no header:", token);
    } else {
      console.warn("Nenhum token encontrado");
    }

    loadUsers(); // só chama depois de setar o token
  };

  initialize();
}, []);

  // Cria ou atualiza
  const onSubmit = async (data: FormData) => {
    try {
      console.log(editingId ? "PUT /usuario" : "POST /usuario");
      console.log("Payload:", data);
      if (editingId) {
        const res = await API.put(`/usuario/${editingId}`, data);
        console.log("Atualizado:", res.data);
        Alert.alert("Sucesso", "Usuário atualizado!");
      } else {
        const res = await API.post("/usuario", data);
        console.log("Criado:", res.data);
        Alert.alert("Sucesso", "Usuário cadastrado!");
      }
reset({
  username: "",
  senha: "",
  matricula: "",
  email: "",
  telefone: "",
  e_adm: false,
});
setEditingId(null);
loadUsers();
    } catch (err: any) {
      Alert.alert(
        "Erro",
        err?.response?.data?.message || "Ocorreu um erro inesperado."
      );
    }
  };

  // Preenche form para edição
  const handleEdit = (user: any) => {
    reset({
      username: user.username,
      senha: "",
      matricula: user.matricula || "",
      email: user.email || "",
      telefone: user.telefone || "",
      e_adm: user.e_adm ?? false,
    });
    setEditingId(user.id_usr);
  };

  // Exclui e recarrega lista
  const handleDelete = async (id: number) => {
    try {
      console.log(" DELETE /usuario/" + id);
      const res = await API.delete(`/usuario/${id}`);
      loadUsers();
    } catch {
      console.error("Erro ao excluir:", err?.response?.data || err.message);
      Alert.alert("Erro", "Não foi possível excluir o usuário.");
    }
  };

  // Cancela edição
  const cancelEdit = () => {
    reset();
    setEditingId(null);
  };

  return (
  <FlatList
    contentContainerStyle={styles.container}
    // monta o form como cabeçalho da lista
    ListHeaderComponent={() => (
      <>
        <Text style={styles.title}>
          {editingId ? "Editar Usuário" : "Cadastro de Novo Usuário"}
        </Text>

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
            />
          )}
        />
        {errors.senha && (
          <Text style={styles.error}>{errors.senha.message}</Text>
        )}

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
            />
          )}
        />
        {errors.matricula && (
          <Text style={styles.error}>{errors.matricula.message}</Text>
        )}

        {/* E-mail */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="E-mail"
              mode="outlined"
              keyboardType="email-address"
              value={value}
              onChangeText={onChange}
              error={!!errors.email}
              style={styles.input}
            />
          )}
        />
        {errors.email && (
          <Text style={styles.error}>{errors.email.message}</Text>
        )}

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
            />
          )}
        />
        {errors.telefone && (
          <Text style={styles.error}>{errors.telefone.message}</Text>
        )}

        {/* Checkbox ADM */}
        <Controller
          control={control}
          name="e_adm"
          render={({ field: { onChange, value } }) => (
            <Checkbox.Item
              label="Administrador?"
              status={value ? "checked" : "unchecked"}
              onPress={() => onChange(!value)}
              position="leading"
              labelStyle={styles.checkboxLabel}
            />
          )}
        />

        {/* Botões */}
        <View style={styles.buttonRow}>
          {editingId && (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={cancelEdit}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting
                ? "Salvando..."
                : editingId
                ? "Atualizar"
                : "Cadastrar"}
            </Text>
          </TouchableOpacity>
        </View>
      </>
    )}
    // dados e renderização dos itens
    data={users}
    keyExtractor={(u) => String(u.id_usr)}
    ItemSeparatorComponent={() => <View style={styles.separator} />}
    renderItem={({ item }) => (
      <View style={styles.userRow}>
        <Text>
          {item.username} {item.e_adm ? "(ADM)" : ""}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleEdit(item)}>
            <Text style={styles.editText}>Editar</Text>
          </TouchableOpacity>
         <TouchableOpacity
  onPress={() => {
    Alert.alert(
      "Confirmar exclusão",
      `Tem certeza que deseja excluir "${item.username}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => handleDelete(item.id_usr) },
      ]
    );
  }}
>
  <Text style={styles.deleteText}>Excluir</Text>
</TouchableOpacity>

        </View>
      </View>
    )}
  />
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
    color: colors.primary,
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.white,
    marginBottom: 12,
  },
  checkboxLabel: {
    color: colors.primary,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: "#AAA",
  },
  buttonText: {
    color: colors.accent,
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#DDD",
    marginVertical: 8,
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
  },
  editText: {
    color: colors.primary,
    marginRight: 12,
  },
  deleteText: {
    color: "red",
  },
});
