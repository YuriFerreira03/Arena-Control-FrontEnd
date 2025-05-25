import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { TextInput, Button } from "react-native-paper";

import Header from "../components/Header";
import HomeButton from "../components/HomeButton";
import { colors } from "../theme/colors";
import api from "../service/api";

/* ─── Tipagens ─── */
interface TableScreenProps {
  navigation: { navigate: (screen: string, params?: any) => void };
}

interface ClassificationTable {
  id_tabela: number;
  nome_tabela: string;
}

export default function TableScreen({ navigation }: TableScreenProps) {
  const [tables, setTables] = useState<ClassificationTable[]>([]);
  const [tableName, setTableName] = useState("");

  const userId = 3; // 🔥 Trocar pelo usuário logado

  /* ─── Buscar tabelas do banco ─── */
  const fetchTables = async () => {
    try {
      const response = await api.get(`/tabelas/user/${userId}`);
      setTables(response.data);
    } catch (error) {
      console.error("Erro ao buscar tabelas:", error);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  /* ─── Criar tabela no banco ─── */
  const handleSaveTable = async () => {
    if (!tableName.trim()) return;

    try {
      await api.post("/tabelas", {
        nome_tabela: tableName.trim(),
        fk_usuario_id_usr: userId,
      });
      setTableName("");
      fetchTables(); // 🔥 Atualiza a lista
      Alert.alert("Sucesso", "Tabela criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar tabela:", error);
      Alert.alert("Erro", "Não foi possível criar a tabela.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── Criar Tabela ─── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Criar Tabela</Text>
          <TextInput
            label="Nome da Tabela"
            mode="outlined"
            value={tableName}
            onChangeText={setTableName}
            style={styles.input}
          />
          <Button
            mode="contained"
            style={styles.saveButton}
            labelStyle={{
              color: colors.white,
              fontSize: 15,
              fontWeight: "bold",
            }}
            onPress={handleSaveTable}
          >
            Salvar Tabela
          </Button>
        </View>

        {/* ─── Listar Tabelas ─── */}
        {tables.length > 0 && (
          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>Tabelas de Classificação</Text>
            {tables.map((t) => (
              <View key={t.id_tabela} style={styles.tableCard}>
                <Text style={styles.tableName}>{t.nome_tabela}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ─── Botão Home ─── */}
        <HomeButton navigation={navigation} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ───────────────────────────────────────────── */
/* ─── Styles ─── */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.primary },
  container: {
    padding: 20,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingBottom: 500,
  },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 12,
  },
  input: { marginBottom: 12 },
  saveButton: {
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: colors.primary,
  },
  listSection: { marginBottom: 32 },
  tableCard: {
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tableName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 8,
  },
});
