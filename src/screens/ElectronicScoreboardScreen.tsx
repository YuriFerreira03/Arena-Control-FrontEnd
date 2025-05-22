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
} from "react-native";
import { useBLEContext } from "../hooks/BLEContext";
import { colors } from "../theme/colors";
import styles from "../styles/PlacarEletronicoStyles";
import HomeButton from "../components/HomeButton";

export default function PlacarEletronico({ navigation }) {
  const { sendCommandToDevice, selectedDevice } = useBLEContext();

  /* ─── Estados de jogo ─── */
  const [pontosA, setPontosA] = useState(0);
  const [setFaltasA, setSetFaltasA] = useState(0);
  const [pedidoTempoA, setPedidoTempoA] = useState(0);
  const [servicoA, setServicoA] = useState("N");
  const [pontosB, setPontosB] = useState(0);
  const [setFaltasB, setSetFaltasB] = useState(0);
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

  /* ─── Helpers BLE ─── */
  const sendCmd = async (cmd: number) => {
    if (!selectedDevice) return Alert.alert("Sem conexão", "Conecte primeiro.");
    try {
      await sendCommandToDevice(cmd);
    } catch (e) {
      console.warn("Falha ao enviar comando", e);
    }
  };

  /* ─── Reset ─── */
  const resetarPlacar = async () => {
    setPontosA(0);
    setSetFaltasA(0);
    setPedidoTempoA(0);
    setServicoA("N");
    setPontosB(0);
    setSetFaltasB(0);
    setPedidoTempoB(0);
    setServicoB("N");
    setCronometro("00:00");
    setIsRunning(false);
    setAlarme("Desligado");
    setPeriodo("1º Período");
    await sendCmd(0x0d); // reset no hardware
  };

  /* ─── Período ─── */
  const handlePeriodoPress = async () => {
    const seq = [
      "1º Período",
      "2º Período",
      "3º Período",
      "4º Período",
      "5º Período",
      "TEMPO EXTRA",
      "PENALTIS",
    ];
    const next = seq[(seq.indexOf(periodo) + 1) % seq.length];
    setPeriodo(next);
    await sendCmd(0x0e);
  };

  /* ─── JSX ─── */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      {/* HEADER (sem ícones) */}
      {/* <Header /> */}

      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

      <TouchableOpacity
        style={styles.actionIcon}
        onPress={() => setActionMenuVisible(true)}
      >
        <Text style={styles.iconInfo}>≡ MENU</Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={actionMenuVisible}
        animationType="fade"
        onRequestClose={() => setActionMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setActionMenuVisible(false)}
        />

        <View style={styles.actionMenuBox}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuVisible(true); // abre o placar que já existe
              setActionMenuVisible(false);
            }}
          >
            <Text style={styles.menuText}>Mostrar Placar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setActionMenuVisible(false);
              Alert.alert("Salvar Período ainda não implementado.");
            }}
          >
            <Text style={styles.menuText}>Salvar Período</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setActionMenuVisible(false);
              Alert.alert("Salvar Jogo ainda não implementado.");
            }}
          >
            <Text style={styles.menuText}>Salvar Jogo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              Alert.alert(
                "Sair", // Título
                "Tem certeza que deseja voltar para a Home?", // Mensagem
                [
                  {
                    text: "Cancelar",
                    style: "cancel",
                  },
                  {
                    text: "Sair",
                    style: "destructive",
                    onPress: () => navigation.navigate("Home"),
                  },
                ]
              )
            }
          >
            <Text style={styles.menuText}>Voltar para Home</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ─────────── CONTAINER PRINCIPAL (branco) ─────────── */}
      <View style={styles.container}>
        {/* 1. BOTÕES AUXILIARES – Mostrar Placar / Salvar PER / Salvar Jogo */}
        {/* <View style={styles.topActionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setMenuVisible(true)}
          >
            <Text style={styles.actionLabel}>Mostrar Placar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert("⚠️", "Salvar Período ainda não pronto")}
          >
            <Text style={styles.actionLabel}>Salvar Período</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert("⚠️", "Salvar Jogo ainda não pronto")}
          >
            <Text style={styles.actionLabel}>Salvar Jogo</Text>
          </TouchableOpacity>
        </View> */}

        {/* 2. EQUIPE A (ocupa 100 %) */}
        <View style={styles.teamBlock}>
          <Text style={styles.teamTitle}>EQUIPE A</Text>

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
                setSetFaltasA((f) => (f >= 20 ? 0 : f + 1));
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
          <Text style={styles.teamTitle}>EQUIPE B</Text>

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
                setSetFaltasB((f) => (f >= 20 ? 0 : f + 1));
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
                onPress={resetarPlacar}
              >
                <Text style={styles.generalLabel}>RESET</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* 1. Botão Home (igual às outras telas) */}
      </View>

      {/* ─── MENU PLACAR (Modal simples) ─── */}
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
        <View style={styles.sideMenu}>
          <Text style={styles.menuText}>Pontos A: {pontosA}</Text>
          <Text style={styles.menuText}>Pontos B: {pontosB}</Text>
          <Text style={styles.menuText}>Período: {periodo}</Text>
          <Text style={styles.menuText}>Cronômetro: {cronometro}</Text>
        </View>
      </Modal>
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

          {selectedPreset && (
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
