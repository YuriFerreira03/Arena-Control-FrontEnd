// screens/PlacarEletronico.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { useBLEContext } from "../hooks/BLEContext";
import { colors } from "../theme/colors";
import styles from "../styles/PlacarEletronicoStyles";
import HomeButton from "../components/HomeButton";
import API from "../service/api";
import VisualizarJogos from "../components/ViewGames";

export default function PlacarEletronico({ navigation }) {
  const { sendCommandToDevice, selectedDevice } = useBLEContext();

  /* ─── Estados de jogo ─── */
  const [pontosA, setPontosA] = useState(0);
  const [faltasA, setFaltasA] = useState(0);
  const [pedidoTempoA, setPedidoTempoA] = useState(0);
  const [servicoA, setServicoA] = useState("N");
  const [pontosB, setPontosB] = useState(0);
  const [faltasB, setFaltasB] = useState(0);
  const [pedidoTempoB, setPedidoTempoB] = useState(0);
  const [servicoB, setServicoB] = useState("N");

  const [cronometro, setCronometro] = useState("00:00");
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [alarme, setAlarme] = useState("Desligado");
  const [periodo, setPeriodo] = useState("1º Período");

  const [menuVisible, setMenuVisible] = useState(false);
  const [presetMenuOpen, setPresetMenuOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [isCountdown, setIsCountdown] = useState(false);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);

  const [placarId, setPlacarId] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const [jogos, setJogos] = useState<JogoDto[]>([]);
  const [jogoSel, setJogoSel] = useState<JogoDto | null>(null);
  const [showJogos, setShowJogos] = useState(false);

  const [savingForPeriodo, setSavingForPeriodo] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const handleEditToggle = () => setIsEditing((prev) => !prev);

  /* ─── Presets ─── */
  const PRESETS = [5, 7, 10, 15, 20, 30];
  const PRESET_CMD: Record<number, number> = {
    5: 0x0f,
    7: 0x10,
    10: 0x11,
    15: 0x12,
    20: 0x13,
    30: 0x14,
  };

  /* ─── Cronômetro ─── */
  useEffect(() => {
    if (!isRunning) return;
    timerRef.current = setInterval(() => {
      setCronometro((prev) => {
        const [m, s] = prev.split(":").map(Number);
        let total = m * 60 + s + (isCountdown ? -1 : 1);
        if (isCountdown && total <= 0) {
          total = 0;
          setIsRunning(false);
          setIsCountdown(false);
        }
        const mm = String(Math.floor(total / 60)).padStart(2, "0");
        const ss = String(total % 60).padStart(2, "0");
        return `${mm}:${ss}`;
      });
    }, 1000);
    return () => clearInterval(timerRef.current as NodeJS.Timeout);
  }, [isRunning, isCountdown]);

  useEffect(() => {
    API.get("/jogos")
      .then((res) => setJogos(res.data))
      .catch(() => Alert.alert("Erro", "Não foi possível carregar jogos"));
  }, []);

  /* ─── Helpers BLE ─── */
  const sendCmd = async (cmd: number) => {
    if (!selectedDevice) return Alert.alert("Sem conexão", "Conecte primeiro.");
    try {
      await sendCommandToDevice(cmd);
    } catch (e) {
      console.warn("Falha ao enviar comando", e);
    }
  };

  const confirmThen = (action: () => Promise<void>) => {
    if (!saved) {
      Alert.alert(
        "Salvar antes?",
        "Deseja salvar o placar antes de continuar?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Salvar", onPress: () => savePlacar().then(action) },
        ]
      );
    } else {
      action();
    }
  };

  const confirmarResetar = () => {
    Alert.alert(
      "Resetar Placar",
      "Tem certeza que deseja resetar TODO o placar?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Resetar",
          style: "destructive",
          onPress: () => resetarPlacar(),
        },
      ]
    );
  };

  /* ─── Reset ─── */
  const resetarPlacar = async () => {
    setPontosA(0);
    setFaltasA(0);
    setPedidoTempoA(0);
    setServicoA("N");
    setPontosB(0);
    setFaltasB(0);
    setPedidoTempoB(0);
    setServicoB("N");
    setCronometro("00:00");
    setIsRunning(false);
    setAlarme("Desligado");
    setPeriodo("1º Período");
    await sendCmd(0x0d); // reset no hardware
  };

  const handleSave = () => {
    savePlacar();
    setIsEditing(false); // volta ao modo de visualização
    setMenuVisible(false);

    if (savingForPeriodo) {
      avancarPeriodo();
      setSavingForPeriodo(false);
    }
  };

  const invalidInputs = [
    pontosA,
    faltasA,
    servicoA,
    pedidoTempoA,
    pontosB,
    faltasB,
    servicoB,
    pedidoTempoB,
  ].some((n) => Number.isNaN(n));

  /* ─── Período ─── */
  const handlePeriodoPress = () => {
    Alert.alert(
      "Atenção",
      "Para mudar de período é necessário salvar o placar.",
      [
        {
          text: "Continuar", // 2️⃣ botão exibido no Alert
          onPress: () => {
            // 3️⃣ fluxo original após confirmar
            setSavingForPeriodo(true);
            setMenuVisible(true);
            setActionMenuVisible(false);
          },
        },
      ],
      { cancelable: true } // fecha tocando fora se quiser
    );
  };
  const avancarPeriodo = async () => {
    const next = periodos[(periodos.indexOf(periodo) + 1) % periodos.length];
    setPeriodo(next);
    await sendCmd(0x0e);
  };

  const periodos = [
    "1º Período",
    "2º Período",
    "3º Período",
    "4º Período",
    "5º Período",
    "TEMPO EXTRA",
    "PENALTIS",
  ];

  async function savePlacar() {
    console.log("✅ Jogo Selecionado:", jogoSel);

    const payload = {
      pontos_time_a: pontosA,
      pontos_time_b: pontosB,
      set_faltas_a: faltasA,
      set_faltas_b: faltasB,
      periodo: periodos.indexOf(periodo) + 1,
      pedido_tempo_a: pedidoTempoA,
      pedido_tempo_b: pedidoTempoB,
      jogo_id: jogoSel.id_jogo,
    };

    console.log("🔔 Salvando placar:", payload);

    try {
      const res = await API.post("/placar", payload);

      console.log("🔔 Resposta do servidor:", res.data);

      // 👇 Pega corretamente o id do placar criado/atualizado
      setPlacarId(res.data.id_placar);

      setSaved(true);
      Alert.alert("Sucesso", "Placar salvo!");
    } catch (error) {
      console.error("❌ Erro ao salvar placar:", error);
      Alert.alert("Erro", "Não foi possível salvar.");
    }

    console.log("🔔 Placar salvo com ID:", placarId);
  }

  /* ─── JSX ─── */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      {/* HEADER (sem ícones) */}
      {/* <Header /> */}

      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

      {/* {jogoSel && (
        <View style={styles.gameInfo}>
          <Text style={styles.gameTitle}>
            {jogoSel.nome_time_a} x {jogoSel.nome_time_b}
          </Text>
          {jogoSel.nome_jogo ? (
            <Text style={styles.gameSubtitle}>{jogoSel.nome_jogo}</Text>
          ) : null}
          {jogoSel.data_hora && (
            <Text style={styles.gameDate}>
              {new Date(jogoSel.data_hora).toLocaleDateString("pt-BR")}
            </Text>
          )}
        </View>
      )} */}

      {/* Ícone que abre o menu */}
      <TouchableOpacity
        style={styles.actionIcon}
        onPress={() => setActionMenuVisible(true)}
      >
        <Text style={styles.iconInfo}>≡ MENU</Text>
      </TouchableOpacity>

      {/* Único Modal do menu */}
      <Modal
        transparent
        visible={actionMenuVisible}
        animationType="fade"
        onRequestClose={() => {
          setActionMenuVisible(false);
          setShowJogos(false);
        }}
      >
        {/* Overlay que fecha tudo */}
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => {
            setActionMenuVisible(false);
            setShowJogos(false);
          }}
        />

        {/* Caixa do menu */}
        <View style={styles.actionMenuBox}>
          {showJogos ? (
            // ─── Lista de Jogos ───
            jogos.map((g) => (
              <TouchableOpacity
                key={g.id_jogo}
                style={styles.menuItem}
                onPress={() => {
                  setJogoSel(g);
                  setShowJogos(false);
                  setActionMenuVisible(false);
                  Alert.alert(
                    "Jogo vinculado",
                    `${g.nome_time_a} x ${g.nome_time_b}`
                  );
                }}
              >
                <Text style={styles.menuText}>
                  {g.nome_time_a} x {g.nome_time_b}
                </Text>
                <Text style={styles.menuSubtext}>
                  {new Date(g.data_hora).toLocaleDateString("pt-BR")}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            // ─── Menu Principal ───
            <>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(true); // abre o placar existente
                  setActionMenuVisible(false);
                }}
              >
                <Text style={styles.menuText}>Mostrar Placar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setShowJogos(true)}
              >
                <Text style={styles.menuText}>Vincular Jogos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setActionMenuVisible(false);
                  navigation.navigate("Home");
                }}
              >
                <Text style={styles.menuText}>Voltar para Home</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>

      <View style={styles.container}>
        <View style={styles.teamBlock}>
          <Text style={styles.sectionTitle}>
            {jogoSel?.nome_time_a || "Equipe A"}
          </Text>

          {/* +1 / -1 Pontos */}
          <View style={styles.pointsButtons}>
            <TouchableOpacity
              style={styles.bigButton}
              onPress={async () => {
                setPontosA((p) => (p >= 199 ? 0 : p + 1));
                await sendCmd(0x01);
              }}
            >
              <Text style={styles.bigBtnLabel}>+1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bigButton}
              onPress={async () => {
                setPontosA((p) => (p > 0 ? p - 1 : p));
                await sendCmd(0x02);
              }}
            >
              <Text style={styles.bigBtnLabel}>-1</Text>
            </TouchableOpacity>
          </View>

          {/* SF / SV / PT */}
          <View style={styles.miscRow}>
            <TouchableOpacity
              style={styles.miscButton}
              onPress={async () => {
                setFaltasA((f) => (f >= 20 ? 0 : f + 1));
                await sendCmd(0x06);
              }}
            >
              <Text style={styles.miscBtnLabel}>SELT/FALTAS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.miscButton}
              onPress={async () => {
                setServicoA((s) => (s === "S" ? "N" : "S"));
                await sendCmd(0x05);
              }}
            >
              <Text style={styles.miscBtnLabel}>SERVIÇO A</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.miscButton}
              onPress={async () => {
                setPedidoTempoA((t) => (t >= 2 ? 0 : t + 1));
                await sendCmd(0x04);
              }}
            >
              <Text style={styles.miscBtnLabel}>PEDIDO TEMP</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.miscLabel}>
            {/* SF:{setFaltasA} SV:{servicoA} PT:{pedidoTempoA} */}
          </Text>
        </View>

        {/* 2. (cont.) EQUIPE B – logo abaixo, ocupa 100 % */}
        <View style={[styles.teamBlock, { marginTop: 10 }]}>
          <Text style={styles.sectionTitle}>
            {jogoSel?.nome_time_b || "Equipe B"}
          </Text>

          <View style={styles.pointsButtons}>
            <TouchableOpacity
              style={styles.bigButton}
              onPress={async () => {
                setPontosB((p) => (p >= 199 ? 0 : p + 1));
                await sendCmd(0x03);
              }}
            >
              <Text style={styles.bigBtnLabel}>+1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bigButton}
              onPress={async () => {
                setPontosB((p) => (p > 0 ? p - 1 : p));
                await sendCmd(0x0a);
              }}
            >
              <Text style={styles.bigBtnLabel}>-1</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.miscRow}>
            <TouchableOpacity
              style={styles.miscButton}
              onPress={async () => {
                setFaltasB((f) => (f >= 20 ? 0 : f + 1));
                await sendCmd(0x07);
              }}
            >
              <Text style={styles.miscBtnLabel}>SET/FALTAS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.miscButton}
              onPress={async () => {
                setServicoB((s) => (s === "S" ? "N" : "S"));
                await sendCmd(0x08);
              }}
            >
              <Text style={styles.miscBtnLabel}>SERVIÇO B</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.miscButton}
              onPress={async () => {
                setPedidoTempoB((t) => (t >= 2 ? 0 : t + 1));
                await sendCmd(0x09);
              }}
            >
              <Text style={styles.miscBtnLabel}>PEDIDO TEMP</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.miscLabel}>
            {/* SF:{setFaltasB} SV:{servicoB} PT:{pedidoTempoB} */}
          </Text>
        </View>

        {/* 3. BLOCO GERAL – cronômetro & controles */}
        <View style={[styles.teamBlock, { marginTop: 10 }]}>
          <View style={styles.generalBlock}>
            {/* Linha 1 */}
            <View style={styles.generalRow}>
              <TouchableOpacity
                style={styles.generalCircle1}
                onPress={async () => {
                  setIsRunning((r) => !r);
                  await sendCmd(0x0b);
                }}
              >
                <Text style={styles.generalLabel}>
                  {isRunning ? "PAUSAR CRONÔMETRO" : "INICIAR CRONÔMETRO"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.generalCircle}
                onPress={async () => {
                  setAlarme((a) => (a === "Ligado" ? "Desligado" : "Ligado"));
                  await sendCmd(0x0c);
                }}
              >
                <Text style={styles.generalLabel}>ALARME</Text>
              </TouchableOpacity>
            </View>

            {/* Linha 2 */}
            <View style={styles.generalRow}>
              <TouchableOpacity
                style={styles.generalCircle}
                onPress={handlePeriodoPress}
              >
                <Text style={styles.generalLabel}>PERÍODO</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.generalCircle}
                onPress={() => setPresetMenuOpen(true)}
              >
                <Text style={styles.generalLabel}>PRESET</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.generalCircle}
                onPress={confirmarResetar}
              >
                <Text style={styles.generalLabel}>RESET</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* 1. Botão Home (igual às outras telas) */}
      </View>

      {/* ==================== MODAL PRINCIPAL ==================== */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        />

        <View style={styles.modalContainer}>
          {/* ─── Cabeçalho do Jogo ─── */}
          {jogoSel && (
            <View style={styles.card}>
              <Text style={styles.gameTitle}>
                {jogoSel.nome_time_a} vs {jogoSel.nome_time_b}
              </Text>
              {!!jogoSel.nome_jogo && (
                <Text style={styles.gameSubtext}>
                  Tipo: {jogoSel.nome_jogo}
                </Text>
              )}
              {!!jogoSel.data_hora && (
                <Text style={styles.gameSubtext}>
                  Data:{" "}
                  {new Date(jogoSel.data_hora).toLocaleDateString("pt-BR")}
                </Text>
              )}
            </View>
          )}

          {/* ─── Placar Equipe A ─── */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              {jogoSel?.nome_time_a || "Equipe A"}
            </Text>

            {/* Pontos A */}
            <View style={styles.row}>
              <Text style={styles.infoLabel}>Pontos:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(pontosA)}
                  onChangeText={(txt) => setPontosA(Number(txt) || 0)}
                />
              ) : (
                <Text style={styles.info}>{pontosA}</Text>
              )}
            </View>

            {/* Faltas A */}
            <View style={styles.row}>
              <Text style={styles.infoLabel}>Faltas:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(faltasA)}
                  onChangeText={(txt) => setFaltasA(Number(txt) || 0)}
                />
              ) : (
                <Text style={styles.info}>{faltasA}</Text>
              )}
            </View>

            {/* Serviço A */}
            <View style={styles.row}>
              <Text style={styles.infoLabel}>Serviço:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(servicoA)}
                  onChangeText={(txt) => setServicoA(Number(txt) || 0)}
                />
              ) : (
                <Text style={styles.info}>{servicoA}</Text>
              )}
            </View>

            {/* Pedido Tempo A */}
            <View style={styles.row}>
              <Text style={styles.infoLabel}>Pedido Tempo:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(pedidoTempoA)}
                  onChangeText={(txt) => setPedidoTempoA(Number(txt) || 0)}
                />
              ) : (
                <Text style={styles.info}>{pedidoTempoA}</Text>
              )}
            </View>
          </View>

          {/* ─── Placar Equipe B ─── */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              {jogoSel?.nome_time_b || "Equipe B"}
            </Text>

            {/* Pontos B */}
            <View style={styles.row}>
              <Text style={styles.infoLabel}>Pontos:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(pontosB)}
                  onChangeText={(txt) => setPontosB(Number(txt) || 0)}
                />
              ) : (
                <Text style={styles.info}>{pontosB}</Text>
              )}
            </View>

            {/* Faltas B */}
            <View style={styles.row}>
              <Text style={styles.infoLabel}>Faltas:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(faltasB)}
                  onChangeText={(txt) => setFaltasB(Number(txt) || 0)}
                />
              ) : (
                <Text style={styles.info}>{faltasB}</Text>
              )}
            </View>

            {/* Serviço B */}
            <View style={styles.row}>
              <Text style={styles.infoLabel}>Serviço:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(servicoB)}
                  onChangeText={(txt) => setServicoB(Number(txt) || 0)}
                />
              ) : (
                <Text style={styles.info}>{servicoB}</Text>
              )}
            </View>

            {/* Pedido Tempo B */}
            <View style={styles.row}>
              <Text style={styles.infoLabel}>Pedido Tempo:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(pedidoTempoB)}
                  onChangeText={(txt) => setPedidoTempoB(Number(txt) || 0)}
                />
              ) : (
                <Text style={styles.info}>{pedidoTempoB}</Text>
              )}
            </View>
          </View>

          {/* ─── Geral ─── */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Geral</Text>
            <Text style={styles.info}>Período: {periodo}</Text>
            <Text style={styles.info}>Cronômetro: {cronometro}</Text>
          </View>

          {/* ─── Botões ─── */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditToggle}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? "Cancelar" : "Editar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isEditing && invalidInputs}
          >
            <Text style={styles.saveButtonText}>Salvar Placar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ==================== MODAL DE PRESETS ==================== */}
      <Modal
        transparent
        visible={presetMenuOpen}
        animationType="fade"
        onRequestClose={() => setPresetMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setPresetMenuOpen(false)}
        />

        <View style={styles.presetBox}>
          {PRESETS.map((min) => (
            <TouchableOpacity
              key={min}
              style={[
                styles.presetOption,
                selectedPreset === min && styles.presetSelected,
              ]}
              onPress={() => setSelectedPreset(min)}
            >
              <Text style={styles.menuText}>{min} min</Text>
            </TouchableOpacity>
          ))}

          {!!selectedPreset && (
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={async () => {
                setCronometro(`${String(selectedPreset).padStart(2, "0")}:00`);
                setIsCountdown(true);
                setIsRunning(false);
                await sendCmd(PRESET_CMD[selectedPreset]);
                setPresetMenuOpen(false);
              }}
            >
              <Text style={styles.menuText}>CONFIRMAR</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
