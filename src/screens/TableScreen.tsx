import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/Header";
import HomeButton from "../components/HomeButton";
import { colors } from "../theme/colors";
import api from "../service/api";
import { useForm, Controller } from "react-hook-form";
import API from "../service/api";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { useRef } from "react";

/* ─── Tipagens ─── */
interface TableScreenProps {
  navigation: { navigate: (screen: string, params?: any) => void };
}

interface ClassificationTable {
  id_tabela: number;
  nome_tabela: string;
}

interface FormData {
  gameName: string;
  teamA: string;
  teamB: string;
  gameDate: Date;
}

export default function TableScreen({ navigation }: TableScreenProps) {
  const [tableName, setTableName] = useState("");
  const [showJogadosList, setShowJogadosList] = useState(false);
  const [jogados, setJogosJogados] = useState<JogoDto[]>([]);
  const [tables, setTables] = useState<ClassificationTable[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalJogadoVisible, setModalJogadoVisible] = useState(false);
  const [placares, setPlacares] = useState<PlacarDto[]>([]);
  const [showTableList, setShowTableList] = useState(false);
  const [classificationData, setClassificationData] = useState<any[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [jogosVinculados, setJogosVinculados] = useState<number[]>([]);
  const [selectedJogado, setSelectedJogado] = useState<JogoDto | null>(null);
  const [modalTabelaVisible, setModalTabelaVisible] = useState(false);
  const [jogoSelecionado, setJogoSelecionado] = useState<JogoDto | null>(null);
  const tableRef = useRef<View>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      gameName: "",
      teamA: "",
      teamB: "",
      gameDate: new Date(),
    },
  });

  const handleEdit = (item: any) => {
    reset({
      gameName: item.nome_jogo,
      teamA: item.nome_time_a,
      teamB: item.nome_time_b,
      gameDate: new Date(item.data_hora),
    });
    setEditingId(item.id_jogo);
  };

  async function exportToPng() {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão negada", "Não foi possível salvar imagem.");
        return;
      }

      // captura a view como PNG
      const uri = await captureRef(tableRef, {
        format: "png",
        quality: 1,
      });

      // opcional: salvar direto no rolo
      // await MediaLibrary.createAssetAsync(uri);

      // ou abrir share sheet
      await Sharing.shareAsync(uri);
    } catch (err) {
      console.error("Erro ao exportar PNG:", err);
      Alert.alert("Erro", "Falha ao gerar PNG.");
    }
  }

  const fetchTables = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await api.get("/tabelas", {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      setTables(response.data);
    } catch (error) {
      console.error("Erro ao buscar tabelas:", error);
    }
  };

  const fetchClassificacao = async (tabelaId: number) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await api.get(`/tabelas/${tabelaId}/classificacao`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      console.log("Classificação recebida:", res.data);

      setClassificationData(res.data);
      setSelectedTableId(tabelaId);
    } catch (error: any) {
      console.log("BACK-ERROR:", error?.response?.data);
      console.error("Erro ao buscar classificação:", error);
      Alert.alert(
        "Erro",
        error.response?.data?.message ??
          "Não foi possível carregar a classificação"
      );
    }
  };

  function filtrarPlacaresMaisRecentes(placares: PlacarDto[]) {
    const mapa = new Map<number, PlacarDto>();
    const ordenado = placares.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    ordenado.forEach((p) => {
      const periodo = p.periodo ?? 0;
      if (!mapa.has(periodo)) mapa.set(periodo, p);
    });
    return Array.from(mapa.values());
  }

  async function fetchPlacarDoJogo(jogoId: number) {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await API.get<PlacarDto[]>(`/placar/jogo/${jogoId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      setPlacares(filtrarPlacaresMaisRecentes(res.data));
    } catch {
      Alert.alert("Erro", "Não foi possível carregar o placar.");
    }
  }

  const handleSaveTable = async () => {
    const token = await AsyncStorage.getItem("token");

    if (!tableName.trim()) return;

    try {
      await api.post(
        "/tabelas",
        { nome_tabela: tableName.trim() },
        {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        }
      );
      Alert.alert("Sucesso", "Tabela criada com sucesso!");
      fetchTables();
      setTableName("");
    } catch (error) {
      console.error("Erro ao criar tabela:", error);
      Alert.alert(
        "Erro",
        error.response?.data?.message || "Não foi possível criar a tabela."
      );
    }
  };

  const fetchJogosJogados = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await API.get("/jogos/jogados/lista", {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      setJogosJogados(res.data);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os jogos jogados.");
    }
  };

  const handleVincularJogo = async (tabelaId: number, jogoId: number) => {
    try {
      const token = await AsyncStorage.getItem("token");
      console.log("Payload ->", { nome_tabela: tableName.trim() });
      await api.post(
        `/tabelas/${tabelaId}/vincular-jogo`,
        { gameId: jogoId },
        {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        }
      );
      Alert.alert("Sucesso", "Jogo vinculado à tabela com sucesso!");
      setJogosVinculados((prev) => [...prev, jogoId]); // 🔥 Marca como vinculado no front
    } catch (error) {
      console.error("Erro ao vincular jogo:", error);
      Alert.alert("Erro", "Não foi possível vincular o jogo.");
    }
  };

  useEffect(() => {
    fetchTables();
    fetchJogosJogados();
  }, []);

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

          {/* ---------- LISTA JOGOS JOGADOS (mantida) ---------- */}
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowJogadosList((v) => !v)}
          >
            <Text style={styles.toggleButtonText}>
              {showJogadosList
                ? "Vincular Jogos Concluidos"
                : "Vincular Jogos Concluidos"}
            </Text>
          </TouchableOpacity>

          {showJogadosList && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
                Jogos Concluídos
              </Text>

              {jogados.length === 0 ? (
                <Text style={{ textAlign: "center", marginTop: 8 }}>
                  Nenhum jogo com placar ainda.
                </Text>
              ) : (
                <FlatList
                  data={jogados}
                  keyExtractor={(i) => i.id_jogo.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.card}
                      onPress={() => {
                        if (jogosVinculados.includes(item.id_jogo)) {
                          Alert.alert(
                            "Atenção",
                            "Este jogo já foi vinculado a tabela."
                          );
                          return;
                        }
                        if (tables.length === 0) {
                          Alert.alert("Atenção", "Nenhuma tabela cadastrada.");
                          return;
                        }
                        setJogoSelecionado(item);
                        setModalTabelaVisible(true);
                      }}
                    >
                      <Text style={styles.cardTitle}>{item.nome_jogo}</Text>
                      <Text style={styles.cardTitle}>
                        {item.nome_time_a}{" "}
                        {item.resultado_final?.pontos_time_a ?? 0} x{" "}
                        {item.resultado_final?.pontos_time_b ?? 0}{" "}
                        {item.nome_time_b}
                      </Text>
                      <Text style={styles.cardDate}>
                        {new Date(item.data_hora).toLocaleDateString("pt-BR")}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}
              <Modal
                transparent
                visible={modalTabelaVisible}
                animationType="slide"
                onRequestClose={() => setModalTabelaVisible(false)}
              >
                <TouchableOpacity
                  style={styles.overlay}
                  activeOpacity={1}
                  onPress={() => setModalTabelaVisible(false)}
                />
                <View style={styles.sideMenu}>
                  <Text style={styles.sectionTitle}>Escolha uma Tabela</Text>

                  {tables.length === 0 ? (
                    <Text style={{ textAlign: "center", marginTop: 8 }}>
                      Nenhuma tabela cadastrada.
                    </Text>
                  ) : (
                    tables.map((t) => (
                      <TouchableOpacity
                        key={t.id_tabela}
                        style={styles.card}
                        onPress={() => {
                          handleVincularJogo(
                            t.id_tabela,
                            jogoSelecionado!.id_jogo
                          );
                          setModalTabelaVisible(false);
                        }}
                      >
                        <Text style={styles.cardTitle}>{t.nome_tabela}</Text>
                      </TouchableOpacity>
                    ))
                  )}

                  <TouchableOpacity
                    style={styles.menuItem1}
                    onPress={() => setModalTabelaVisible(false)}
                  >
                    <Text style={styles.menuText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
            </>
          )}

          <Modal
            transparent
            visible={modalJogadoVisible}
            animationType="slide"
            onRequestClose={() => setModalJogadoVisible(false)}
          >
            <TouchableOpacity
              style={styles.overlay}
              activeOpacity={1}
              onPress={() => setModalJogadoVisible(false)}
            />
            <View style={styles.sideMenu}>
              {selectedJogado &&
                placares.map((p) => (
                  <View key={p.id_placar} style={styles.card}>
                    <Text style={styles.sectionTitle}>Período {p.periodo}</Text>

                    <Text style={styles.info}>
                      Pontos {selectedJogado?.nome_time_a}: {p.pontos_time_a}
                    </Text>
                    <Text style={styles.info}>
                      Pontos {selectedJogado?.nome_time_b}: {p.pontos_time_b}
                    </Text>

                    <Text style={styles.info}>
                      Faltas {selectedJogado?.nome_time_a}: {p.set_faltas_a}
                    </Text>
                    <Text style={styles.info}>
                      Faltas {selectedJogado?.nome_time_b}: {p.set_faltas_b}
                    </Text>

                    <Text style={styles.info}>
                      Pedido Tempo {selectedJogado?.nome_time_a}:{" "}
                      {p.pedido_tempo_a}
                    </Text>
                    <Text style={styles.info}>
                      Pedido Tempo {selectedJogado?.nome_time_b}:{" "}
                      {p.pedido_tempo_b}
                    </Text>
                  </View>
                ))}

              {placares.length > 1 && (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Resultado Final</Text>
                  <Text style={styles.info}>
                    Pontos {selectedJogado?.nome_time_a}:{" "}
                    {placares.reduce(
                      (sum, p) => sum + (p.pontos_time_a ?? 0),
                      0
                    )}
                  </Text>
                  <Text style={styles.info}>
                    Pontos {selectedJogado?.nome_time_b}:{" "}
                    {placares.reduce(
                      (sum, p) => sum + (p.pontos_time_b ?? 0),
                      0
                    )}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.menuItem1}
                onPress={() => setModalJogadoVisible(false)}
              >
                <Text style={styles.menuText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>

        <TouchableOpacity
          style={styles.toggleButton1}
          onPress={() => setShowTableList((v) => !v)}
        >
          <Text style={styles.toggleButtonText}>
            {showTableList ? "Ocultar Tabelas" : "Mostrar Tabelas"}
          </Text>
        </TouchableOpacity>

        {selectedTableId && (
          <View
            ref={tableRef}
            style={{ backgroundColor: "white", padding: 10, minHeight: 200 }}
          >
            <Text style={styles.sectionTitle}>
              {tables.find((t) => t.id_tabela === selectedTableId)?.nome_tabela}
            </Text>

            {/* Cabeçalho */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text
                style={[styles.cell, styles.cellTeam, styles.tableHeaderText]}
              >
                Time
              </Text>
              <Text style={[styles.cell, styles.tableHeaderText]}>PTS</Text>
              <Text style={[styles.cell, styles.tableHeaderText]}>VIT</Text>
              <Text style={[styles.cell, styles.tableHeaderText]}>EMP</Text>
              <Text style={[styles.cell, styles.tableHeaderText]}>DER</Text>
              <Text style={[styles.cell, styles.tableHeaderText]}>SG</Text>
            </View>

            {/* Dados */}
            {classificationData.length === 0 ? (
              <Text style={{ textAlign: "center", marginTop: 8 }}>
                Nenhum time cadastrado nessa tabela.
              </Text>
            ) : (
              classificationData.map((item) => (
                <View key={item.id_tabela_time} style={styles.tableRow}>
                  <Text style={[styles.cell, styles.cellTeam]}>
                    {item.team}
                  </Text>
                  <Text style={styles.cell}>{item.pontos}</Text>
                  <Text style={styles.cell}>{item.vitorias}</Text>
                  <Text style={styles.cell}>{item.empates}</Text>
                  <Text style={styles.cell}>{item.derrotas}</Text>
                  <Text style={styles.cell}>{item.saldo_gols}</Text>
                </View>
              ))
            )}

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => {
                setSelectedTableId(null);
                setClassificationData([]);
              }}
            >
              <Text style={styles.toggleButtonText}>Fechar Classificação</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity onPress={exportToPng}>
              <Text style={styles.toggleButton}>PNG</Text>
            </TouchableOpacity> */}

            <TouchableOpacity style={styles.toggleButton} onPress={exportToPng}>
              <Text style={styles.toggleButtonText}>PNG</Text>
            </TouchableOpacity>
          </View>
        )}

        {showTableList && (
          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>Tabelas de Classificação</Text>
            {tables.map((t) => (
              <TouchableOpacity
                key={t.id_tabela}
                style={styles.card}
                onPress={() => fetchClassificacao(t.id_tabela)}
              >
                <Text style={styles.cardTitle}>{t.nome_tabela}</Text>
              </TouchableOpacity>
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
    paddingBottom: 300,
  },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 12,
    marginTop: 15,
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
  toggleButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 38,
  },
  toggleButton: {
    backgroundColor: colors.primary,
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderRadius: 12,
    width: "100%",
    height: 50,
    alignItems: "center",
    marginTop: 16,
  },
  toggleButton3: {
    backgroundColor: colors.primary,
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderRadius: 12,
    width: "80%",
    height: 50,
    alignItems: "center",
    marginTop: 16,
  },
  toggleButton1: {
    backgroundColor: colors.primary,
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderRadius: 12,
    width: "100%",
    height: 50,
    alignItems: "center",
    marginTop: -10,
    marginBottom: 10,
  },
  cardTitle: { fontWeight: "700", fontSize: 16, marginBottom: 4 },
  cardDate: { color: "#666", fontSize: 12 },
  card: {
    backgroundColor: "#f3f3f3",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  info: { fontSize: 14, marginBottom: 2 },
  menuItem1: {
    marginTop: 16,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
  },
  menuText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  sideMenu: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 8,
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    marginBottom: 4,
  },

  tableHeader: {
    backgroundColor: colors.primary,
    borderRadius: 8,
  },

  cell: {
    flex: 1,
    textAlign: "center",
    color: "#333",
    fontWeight: "500",
  },

  cellTeam: {
    flex: 2,
    textAlign: "left",
    paddingLeft: 8,
    fontWeight: "700",
    color: colors.primary,
  },

  tableHeaderText: {
    color: "#FFF",
    fontWeight: "700",
  },
});
