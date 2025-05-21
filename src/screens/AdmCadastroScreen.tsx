import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { TextInput, Checkbox, DataTable, IconButton } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import API from "../service/api";
import { colors } from "../theme/colors";
import Header from "../components/Header";

/* -------------------------------------------------------------------------- */
/*                                Validation                                  */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type FormData = {
  username: string;
  senha: string;
  matricula: string;
  email: string;
  telefone: string;
  e_adm: boolean;
};

export default function AdmCadastroScreen({ navigation }: any) {
  /* --------------------------------- form --------------------------------- */
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

  /* ---------------------------------- data --------------------------------- */
  const [users, setUsers] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  /* ----------------------------- API utilities ----------------------------- */
  const loadUsers = async () => {
    try {
      const res = await API.get("/usuario/created");
      setUsers(res.data);
    } catch (err: any) {
      Alert.alert(
        "Erro",
        err?.response?.data || "Não foi possível carregar usuários."
      );
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token)
        API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      loadUsers();
    };
    initialize();
  }, []);

  /* ------------------------------- CRUD logic ------------------------------ */
  const onSubmit = async (data: FormData) => {
    try {
      if (editingId) {
        await API.put(`/usuario/${editingId}`, data);
        Alert.alert("Sucesso", "Usuário atualizado!");
      } else {
        await API.post("/usuario", data);
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

  const handleDelete = async (id: number) => {
    try {
      await API.delete(`/usuario/${id}`);
      loadUsers();
    } catch (err: any) {
      Alert.alert("Erro", "Não foi possível excluir o usuário.");
    }
  };

  const cancelEdit = () => {
    reset({
      username: "",
      senha: "",
      matricula: "",
      email: "",
      telefone: "",
      e_adm: false,
    });
    setEditingId(null);
  };

  /* -------------------------------------------------------------------------- */
  /*                                   Render                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <View style={styles.screen}>
      <Header title="Gerenciar usuários" navigation={navigation} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <Text style={styles.title}>
          {editingId ? "Editar Usuário" : "Cadastro de Novo Usuário"}
        </Text>

        {/* ----------------------------- Form fields ----------------------------- */}
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

        <Controller
          control={control}
          name="e_adm"
          render={({ field: { onChange, value } }) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Checkbox
                status={value ? "checked" : "unchecked"}
                onPress={() => onChange(!value)}
                color={colors.primary}
              />
              <Text style={{ fontSize: 16, color: colors.black }}>
                Administrador: {value ? "Sim" : "Não"}
              </Text>
            </View>
          )}
        />

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

        {/* ------------------------------- Table ------------------------------- */}
        {users.length > 0 ? (
          <DataTable style={styles.tableWrapper}>
            <DataTable.Header>
              <DataTable.Title style={{ flex: 2 }}>
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", color: "#ffff" }}
                >
                  Usuário
                </Text>
              </DataTable.Title>

              <DataTable.Title style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}
                >
                  Perfil
                </Text>
              </DataTable.Title>

              <DataTable.Title numeric style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}
                >
                  Ações
                </Text>
              </DataTable.Title>
            </DataTable.Header>

            {users.map((u, idx) => (
              <DataTable.Row key={u.id_usr}>
                <DataTable.Cell
                  style={[
                    styles.cell,
                    { flex: 2, justifyContent: "flex-start" },
                  ]}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 16, fontWeight: "500" }}
                  >
                    {u.username}
                  </Text>
                </DataTable.Cell>

                <DataTable.Cell style={[styles.cell, { flex: 1 }]}>
                  <Text
                    style={{ color: "#fff", fontSize: 16, fontWeight: "500" }}
                  >
                    {u.e_adm ? "ADM" : "Comum"}
                  </Text>
                </DataTable.Cell>
                <View
                  style={{ flexDirection: "row", gap: 2, marginRight: -20 }}
                >
                  <IconButton
                    icon={() => (
                      <MaterialIcons
                        name="edit"
                        size={24}
                        color={colors.primary}
                      />
                    )}
                    containerColor={"#E3F2FD"}
                    onPress={() => handleEdit(u)}
                  />
                  <IconButton
                    icon={() => (
                      <MaterialIcons
                        name="delete"
                        size={24}
                        color={"#FFFFFF"}
                      />
                    )}
                    containerColor="#E53935"
                    onPress={() =>
                      Alert.alert(
                        "Confirmar exclusão",
                        `Tem certeza que deseja excluir \"${u.username}\"?`,
                        [
                          { text: "Cancelar", style: "cancel" },
                          {
                            text: "Excluir",
                            style: "destructive",
                            onPress: () => handleDelete(u.id_usr),
                          },
                        ]
                      )
                    }
                  />
                </View>
              </DataTable.Row>
            ))}
          </DataTable>
        ) : (
          <Text
            style={{
              textAlign: "center",
              fontSize: 20,
              color: colors.black,
              marginTop: 50,
              marginBottom: 40,
              fontFamily: "Inter",
              fontStyle: "normal",
              fontWeight: "500",
            }}
          >
            Não há usuários para editar.
          </Text>
        )}
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.homeButtonText}>Voltar para Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    padding: 24,
    backgroundColor: colors.white,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    flex: 1,
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
  error: {
    color: "#E53935",
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
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
    backgroundColor: "#E53935",
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
  },
  tableWrapper: {
    marginTop: 35,
    backgroundColor: "#003366", // azul com leve opacidade
    borderRadius: 12,
    width: "100%",
    padding: 10,
    borderColor: "#000",
    borderStyle: "solid",
    overflow: "hidden",
    elevation: 4, // sombra mais destacada
    shadowColor: "#000",
    //cor da borda interna da tabela
    borderWidth: 1,
    //cor da sombra
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  rowAlt: {
    backgroundColor: "#f0f0f0",
  },
  cell: {
    borderRightWidth: 1,
    borderColor: "#FFFFFF", // ou outra cor, tipo cinza claro '#CCCCCC'
    paddingVertical: 8,
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  homeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  homeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
