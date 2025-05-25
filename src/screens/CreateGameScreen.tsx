// screens/CreateGameScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { TextInput, IconButton } from "react-native-paper";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useForm, Controller } from "react-hook-form";
import AsyncStorage from "@react-native-async-storage/async-storage";

import API from "../service/api";
import Header from "../components/Header";
import HomeButton from "../components/HomeButton";
import { colors } from "../theme/colors";

interface FormData {
  gameName: string;
  teamA: string;
  teamB: string;
  gameDate: Date;
}

export default function CreateGameScreen({ navigation }) {
  /* ---------------------------- local states ---------------------------- */
  const [games, setGames] = useState<any[]>([]);
  const [jogados, setJogosJogados] = useState<JogoDto[]>([]);
  const [selectedJogado, setSelectedJogado] = useState<JogoDto | null>(null);
  const [placares, setPlacares] = useState<PlacarDto[]>([]);
  const [modalJogadoVisible, setModalJogadoVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [showCreated, setShowCreated] = useState(false);
  const [showJogadosList, setShowJogadosList] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  /* -------------------------- helpers / totals -------------------------- */
  const totalPontosA = placares.reduce(
    (sum, p) => sum + (p.pontos_time_a ?? 0),
    0
  );
  const totalPontosB = placares.reduce(
    (sum, p) => sum + (p.pontos_time_b ?? 0),
    0
  );

  /* ---------------------------- form config ----------------------------- */
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

  /* --------------------------- fetch helpers ---------------------------- */
  const fetchGames = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await API.get("/jogos", {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      setGames(res.data);
    } catch (e) {
      console.warn("Erro ao buscar jogos", e);
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

  useEffect(() => {
    fetchGames();
    fetchJogosJogados();
  }, []);

  /* ------------------------ placar util (filtro) ------------------------ */
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

  /* -------------------------- CRUD functions --------------------------- */
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const payload = {
        nome_jogo: data.gameName,
        nome_time_a: data.teamA,
        nome_time_b: data.teamB,
        data_hora: data.gameDate.toISOString(),
      };
      const token = await AsyncStorage.getItem("token");

      if (editingId) {
        await API.put(`/jogos/${editingId}`, payload, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        });
        Alert.alert("Sucesso", "Jogo atualizado!");
        setEditingId(null);
      } else {
        const res = await API.post("/jogos", payload, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        });
        setGames((prev) => [...prev, res.data]);
        Alert.alert("Sucesso", "Jogo criado com sucesso!");
      }
      reset();
    } catch (err: any) {
      Alert.alert(
        "Erro",
        err?.response?.data?.message || "Erro ao salvar jogo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    reset({
      gameName: item.nome_jogo,
      teamA: item.nome_time_a,
      teamB: item.nome_time_b,
      gameDate: new Date(item.data_hora),
    });
    setEditingId(item.id_jogo);
  };

  const handleDelete = (id: number) =>
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir este jogo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await API.delete(`/jogos/${id}`, {
                headers: {
                  Authorization: token ? `Bearer ${token}` : undefined,
                },
              });
              setGames((prev) => prev.filter((g) => g.id_jogo !== id));
              Alert.alert("Sucesso", "Jogo excluído!");
            } catch {
              Alert.alert("Erro", "Não foi possível excluir o jogo.");
            }
          },
        },
      ]
    );

  /* ----------------------- helpers de data/hora ----------------------- */
  const [showPickerIOS, setShowPickerIOS] = useState(false);
  const formatDateTime = (d: Date) =>
    new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);

  const openDatePickerAndroid = (
    onChange: (d: Date) => void,
    currentDate: Date
  ) => {
    DateTimePickerAndroid.open({
      value: currentDate,
      mode: "date",
      is24Hour: true,
      onChange: (_, selDate) => {
        if (selDate) {
          DateTimePickerAndroid.open({
            value: selDate,
            mode: "time",
            is24Hour: true,
            onChange: (_, t) => {
              if (t)
                onChange(
                  new Date(
                    selDate.getFullYear(),
                    selDate.getMonth(),
                    selDate.getDate(),
                    t.getHours(),
                    t.getMinutes()
                  )
                );
            },
          });
        }
      },
    });
  };

  /* ------------------------------ render ------------------------------ */
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>
          {editingId ? "Editar Jogo" : "Criar Jogo"}
        </Text>

        {/* ---------- FORM ---------- */}
        <Controller
          control={control}
          name="gameName"
          rules={{ required: "Informe o nome do jogo" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Nome do Jogo"
              mode="outlined"
              value={value}
              onChangeText={onChange}
              error={!!errors.gameName}
              style={styles.input}
            />
          )}
        />
        {errors.gameName && (
          <Text style={styles.error}>{errors.gameName.message}</Text>
        )}

        <Controller
          control={control}
          name="teamA"
          rules={{ required: "Informe o Time A" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Time A"
              mode="outlined"
              value={value}
              onChangeText={onChange}
              error={!!errors.teamA}
              style={styles.input}
            />
          )}
        />
        {errors.teamA && (
          <Text style={styles.error}>{errors.teamA.message}</Text>
        )}

        <Controller
          control={control}
          name="teamB"
          rules={{ required: "Informe o Time B" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Time B"
              mode="outlined"
              value={value}
              onChangeText={onChange}
              error={!!errors.teamB}
              style={styles.input}
            />
          )}
        />
        {errors.teamB && (
          <Text style={styles.error}>{errors.teamB.message}</Text>
        )}

        <Controller
          control={control}
          name="gameDate"
          rules={{ required: "Selecione data e hora" }}
          render={({ field: { onChange, value } }) => (
            <>
              {Platform.OS === "ios" ? (
                <>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowPickerIOS((v) => !v)}
                  >
                    <Text style={styles.dateButtonText}>
                      {formatDateTime(value)}
                    </Text>
                  </TouchableOpacity>
                  {showPickerIOS && (
                    <DateTimePicker
                      value={value}
                      mode="datetime"
                      display="spinner"
                      is24Hour
                      onChange={(e, sel) => {
                        if (sel) onChange(sel);
                        setShowPickerIOS(false);
                      }}
                    />
                  )}
                </>
              ) : (
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => openDatePickerAndroid(onChange, value)}
                >
                  <Text style={styles.dateButtonText}>
                    {formatDateTime(value)}
                  </Text>
                </TouchableOpacity>
              )}
              {errors.gameDate && (
                <Text style={styles.error}>{errors.gameDate.message}</Text>
              )}
            </>
          )}
        />

        {/* ---------- BOTÕES ---------- */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 16,
          }}
        >
          {editingId && (
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: "#9E9E9E", marginRight: 8 },
              ]}
              onPress={() => {
                reset();
                setEditingId(null);
              }}
            >
              <Text style={{ color: colors.white, fontWeight: "bold" }}>
                Cancelar
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSubmit(onSubmit)}
          >
            <Text
              style={{
                color: colors.white,
                fontWeight: "bold",
                fontSize: 16,
                alignSelf: "center",
                lineHeight: 40,
              }}
            >
              {editingId ? "Atualizar Jogo" : "Salvar Jogo"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ---------- LISTA JOGOS CRIADOS ---------- */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowCreated((v) => !v)}
        >
          <Text style={styles.toggleButtonText}>
            {showCreated ? "Ocultar Jogos Criados" : "Mostrar Jogos Criados"}
          </Text>
        </TouchableOpacity>

        {showCreated && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
              Jogos Criados
            </Text>

            {games.length === 0 ? (
              <Text style={{ textAlign: "center", marginTop: 8 }}>
                Nenhum jogo cadastrado ainda.
              </Text>
            ) : (
              <FlatList
                data={games}
                keyExtractor={(i) => i.id_jogo.toString()}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.card,
                      { flexDirection: "row", alignItems: "center" },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{item.nome_jogo}</Text>
                      <Text>
                        {item.nome_time_a} x {item.nome_time_b}
                      </Text>
                      <Text style={styles.cardDate}>
                        {formatDateTime(new Date(item.data_hora))}
                      </Text>
                    </View>

                    <View style={{ flexDirection: "row", marginLeft: 8 }}>
                      <IconButton
                        icon={() => (
                          <MaterialIcons
                            name="edit"
                            size={24}
                            color={colors.primary}
                          />
                        )}
                        containerColor="#E3F2FD"
                        onPress={() => handleEdit(item)}
                      />
                      <IconButton
                        icon={() => (
                          <MaterialIcons name="delete" size={24} color="#FFF" />
                        )}
                        containerColor="#E53935"
                        onPress={() => handleDelete(item.id_jogo)}
                      />
                    </View>
                  </View>
                )}
              />
            )}
          </>
        )}

        {/* ---------- LISTA JOGOS JOGADOS (mantida) ---------- */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowJogadosList((v) => !v)}
        >
          <Text style={styles.toggleButtonText}>
            {showJogadosList
              ? "Ocultar Jogos Concluidos"
              : "Mostrar Jogos Concluidos"}
          </Text>
        </TouchableOpacity>

        {showJogadosList && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
              Jogos Jogados
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
                    onPress={async () => {
                      setSelectedJogado(item);
                      await fetchPlacarDoJogo(item.id_jogo);
                      setModalJogadoVisible(true);
                    }}
                  >
                    <Text style={styles.cardTitle}>{item.nome_jogo}</Text>
                    <Text>
                      {item.nome_time_a} x {item.nome_time_b}
                    </Text>
                    <Text style={styles.cardDate}>
                      {new Date(item.data_hora).toLocaleDateString("pt-BR")}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </>
        )}

        {/* ---------- MODAL PLACARES ---------- */}
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
                  Pontos {selectedJogado?.nome_time_a}: {totalPontosA}
                </Text>
                <Text style={styles.info}>
                  Pontos {selectedJogado?.nome_time_b}: {totalPontosB}
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

        <HomeButton navigation={navigation} />
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </SafeAreaView>
  );
}

/* -------- styles (inalterados) -------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.primary },
  container: {
    padding: 20,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 12,
  },
  input: { marginBottom: 12 },
  dateButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  dateButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderRadius: 12,
    width: "100%",
    height: 50,
    alignItems: "center",
  },
  error: { color: "red", marginBottom: 8 },
  card: {
    backgroundColor: "#f3f3f3",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: { fontWeight: "700", fontSize: 16, marginBottom: 4 },
  cardDate: { color: "#666", fontSize: 12 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
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
  toggleButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 38,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
});
