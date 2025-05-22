import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { TextInput, Button } from "react-native-paper";

import Header from "../components/Header";
import HomeButton from "../components/HomeButton";
import { colors } from "../theme/colors";

/* ─── Tipagens ─── */
interface TableScreenProps {
  navigation: { navigate: (screen: string, params?: any) => void };
}

interface Game {
  id: string;
  name: string;
  teamA: string;
  teamB: string;
  date: Date;
}

interface ClassificationTable {
  id: string;
  name: string;
  victories: number;
  draws: number;
  defeats: number;
  goalDifference: number;
  points: number;
}

/* ───────────────────────────────────────────── */
export default function TableScreen({ navigation }: TableScreenProps) {
  /* ─── Estados ─── */
  const [games, setGames] = useState<Game[]>([]); // Mantém se quiser listar jogos
  const [tables, setTables] = useState<ClassificationTable[]>([]);
  const [tableName, setTableName] = useState("");

  /* ─── Helpers ─── */
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  /* ─── Criar tabela ─── */
  const handleSaveTable = () => {
    if (!tableName.trim()) return;
    setTables((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: tableName.trim(),
        victories: 0,
        draws: 0,
        defeats: 0,
        goalDifference: 0,
        points: 0,
      },
    ]);
    setTableName("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── Botão para criar jogo ───
        <Button
          mode="contained"
          style={styles.saveButton}
          onPress={() => navigation.navigate("CreateGame")}
        >
          Criar Novo Jogo
        </Button> */}

        {/* ─── Lista de Jogos (opcional) ─── */}
        {games.length > 0 && (
          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>Jogos Criados</Text>
            {games.map((g) => (
              <View key={g.id} style={styles.listItem}>
                <Text style={styles.listText}>{g.name}</Text>
                <Text style={styles.listSubText}>
                  {g.teamA} x {g.teamB} – {formatDateTime(g.date)}
                </Text>
              </View>
            ))}
          </View>
        )}
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
              <View key={t.id} style={styles.tableCard}>
                <Text style={styles.tableName}>{t.name}</Text>
                <View style={styles.tableRow}>
                  <Text style={styles.tableHeader}>VIT</Text>
                  <Text style={styles.tableHeader}>EMP</Text>
                  <Text style={styles.tableHeader}>DER</Text>
                  <Text style={styles.tableHeader}>SG</Text>
                  <Text style={styles.tableHeader}>PTS</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>{t.victories}</Text>
                  <Text style={styles.tableCell}>{t.draws}</Text>
                  <Text style={styles.tableCell}>{t.defeats}</Text>
                  <Text style={styles.tableCell}>{t.goalDifference}</Text>
                  <Text style={styles.tableCell}>{t.points}</Text>
                </View>
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
  listItem: { padding: 12, borderBottomWidth: 1, borderColor: "#DDD" },
  listText: { fontSize: 16, fontWeight: "600", color: colors.primary },
  listSubText: { fontSize: 14, color: "#666" },
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
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  tableHeader: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    color: colors.primary,
  },
});
