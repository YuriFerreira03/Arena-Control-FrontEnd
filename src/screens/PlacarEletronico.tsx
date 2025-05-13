import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from "react-native";
import { useBLEContext } from "../hooks/BLEContext";
import styles from "../styles/PlacarEletronicoStyles";

const PlacarEletronico = ({ navigation }) => {
  const { sendCommandToDevice, selectedDevice } = useBLEContext();

  //adicionar um log para ver se o selectDevice está correto
  // console.log("selectedDevice:", selectedDevice);

  // Estados para a Equipe A
  const [pontosA, setPontosA] = useState(0);
  const [setFaltasA, setSetFaltasA] = useState(0);
  const [pedidoTempoA, setPedidoTempoA] = useState(0);
  const [servicoA, setServicoA] = useState("N");

  // Estados para a Equipe B
  const [pontosB, setPontosB] = useState(0);
  const [setFaltasB, setSetFaltasB] = useState(0);
  const [pedidoTempoB, setPedidoTempoB] = useState(0);
  const [servicoB, setServicoB] = useState("N");

  // Estados para o cronômetro, alarme e período
  const [cronometro, setCronometro] = useState("00:00");
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [alarme, setAlarme] = useState("Desligado");
  const [periodo, setPeriodo] = useState("1º Período");

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // presets de contagem regressiva
  const PRESETS = [5, 7, 10, 15, 20, 30]; // minutos
  const PRESET_CMD = {
    5: 0x0f,
    7: 0x10,
    10: 0x11,
    15: 0x12,
    20: 0x13,
    30: 0x14,
  };

  const [presetMenuOpen, setPresetMenuOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null); // minutos
  const [isCountdown, setIsCountdown] = useState(false);

  useEffect(() => {
    if (!isRunning) return; // nada rodando

    timerRef.current = setInterval(() => {
      setCronometro((prev) => {
        const [m, s] = prev.split(":").map(Number);
        let total = m * 60 + s + (isCountdown ? -1 : 1);

        // evita número negativo
        if (isCountdown && total < 0) {
          total = 0;
          setIsRunning(false); // para quando zerar
          setIsCountdown(false);
        }

        const mm = String(Math.floor(total / 60)).padStart(2, "0");
        const ss = String(total % 60).padStart(2, "0");
        return `${mm}:${ss}`;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isRunning, isCountdown]);

  // Função para alternar o serviço entre as equipes
  const alternarServico = () => {
    if (servicoA === "S") {
      setServicoA("N");
      setServicoB("S");
    } else {
      setServicoA("S");
      setServicoB("N");
    }
  };

  // Função para resetar o placar
  const resetarPlacar = () => {
    setPontosA(0);
    setSetFaltasA(0);
    setPedidoTempoA(0);
    setServicoA("N");

    setPontosB(0);
    setSetFaltasB(0);
    setPedidoTempoB(0);
    setServicoB("N");

    setCronometro("00:00");
    setIsRunning(false); // Adicione esta linha para parar o cronômetro
    setAlarme("Desligado");
    //adicioanr mais periodos
    setPeriodo("1º Período");
  };

  /**
   * Envia um único byte de comando ao ESP32 via BLE.
   * O byte será enviado em Base64, que é o formato que a biblioteca BLE espera.
   */
  function arrayBufferToBase64(buffer) {
    let binary = "";
    let bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  async function sendCmd(cmd) {
    if (!selectedDevice) {
      console.warn("Nenhum dispositivo conectado.");
      return;
    }
    try {
      await sendCommandToDevice(cmd);
    } catch (e) {
      console.error("Falha ao enviar comando", e);
    }
  }

  const handlePeriodoPress = async () => {
    try {
      // Envia comando para o dispositivo BLE
      await sendCmd(0x0e);

      // Atualiza o estado local seguindo a sequência correta
      setPeriodo((prev) => {
        const periodos = [
          "1º Período",
          "2º Período",
          "3º Período",
          "4º Período",
          "5º Período",
          "TEMPO EXTRA",
          "PENALTIS",
        ];
        const currentIndex = periodos.indexOf(prev);
        const nextIndex = (currentIndex + 1) % periodos.length;
        return periodos[nextIndex];
      });
    } catch (error) {
      console.error("Erro ao alterar período:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* <View style={styles.placarResumoContainer}> */}
        {/* <Text style={styles.teamName}>CONTROLADOR</Text> */}

        {/* Substitua os TouchableOpacity existentes por este bloco */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => setIsDropdownVisible(!isDropdownVisible)}
          >
            <Text style={styles.buttonText}>Mostrar Placar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => handleGuardarPeriodo()}
          >
            <Text style={styles.buttonText}>Guardar PER/JG</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => handleGuardarJogo()}
          >
            <Text style={styles.buttonText}>Guardar Jogo</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            style={styles.floatingButton1}
            onPress={() =>
              Alert.alert("Sair", "Tem certeza que deseja sair?", [
                {
                  text: "Cancelar",
                  style: "cancel",
                },
                {
                  text: "Sair",
                  onPress: () => navigation.navigate("Home"), // Substitua 'Home' pela sua tela inicial
                },
              ])
            }
          >
            <Text style={styles.buttonText}>Sair</Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo do Dropdown */}
        {isDropdownVisible && (
          <>
            <TouchableOpacity
              style={styles.overlay}
              activeOpacity={1}
              onPress={() => setIsDropdownVisible(false)}
            />
            <View style={styles.dropdownContainer}>
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.placarResumoContainer}>
                  <View style={styles.row}>
                    {/* Equipe A */}
                    <View style={styles.resumoEquipe}>
                      <Text style={styles.info1}> Equipe A</Text>
                      <Text style={styles.info1}> Pontos: {pontosA} </Text>
                      <Text style={styles.info1}>Set/Flt: {setFaltasA}</Text>
                      <Text style={styles.info1}>P. Tempo: {pedidoTempoA}</Text>
                      <Text style={styles.info1}>Serviço: {servicoA}</Text>
                    </View>

                    {/* Equipe B */}
                    <View style={styles.resumoEquipe2}>
                      <Text style={styles.info1}> Equipe B</Text>
                      <Text style={styles.info1}> Pontos: {pontosB} </Text>
                      <Text style={styles.info1}>Set/Flt: {setFaltasB}</Text>
                      <Text style={styles.info1}>P. Tempo: {pedidoTempoB}</Text>
                      <Text style={styles.info1}>Serviço: {servicoB}</Text>
                    </View>
                  </View>

                  <View style={styles.resumoEquipe1}>
                    <Text style={styles.info1}>Cronômetro: {cronometro}</Text>
                    <Text style={styles.info1}>Alarme: {alarme}</Text>
                    <Text style={styles.info1}>Período: {periodo}</Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          </>
        )}
        {presetMenuOpen && (
          <>
            <TouchableOpacity
              style={styles.overlay}
              onPress={() => {
                setPresetMenuOpen(false);
                setSelectedPreset(null);
              }}
            />
            <View style={styles.dropdownContainer}>
              {PRESETS.map((min) => (
                <TouchableOpacity
                  key={min}
                  style={[
                    styles.dropdownItem,
                    selectedPreset === min && styles.dropdownItemSelected,
                  ]}
                  onPress={() => setSelectedPreset(min)}
                >
                  <Text style={styles.info}>{min} min</Text>
                </TouchableOpacity>
              ))}
              {selectedPreset && (
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={async () => {
                    setCronometro(
                      `${String(selectedPreset).padStart(2, "0")}:00`
                    );
                    setIsCountdown(true);
                    setIsRunning(false);
                    setPresetMenuOpen(false);
                    await sendCmd(PRESET_CMD[selectedPreset]);
                  }}
                >
                  <Text style={styles.buttonText}>CONFIRMAR PRESET</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
        {/* </View> */}

        <View style={styles.mainContainer}>
          <View
            style={{
              flex: 1,
            }}
          >
            {/*fazer um container para mostrador de placar*/}

            <View style={styles.mainContainer1}>
              {/* Equipe A */}
              <View style={[styles.teamContainer, { width: "90%" }]}>
                <Text style={styles.teamName}>EQUIPE A</Text>
                {/* SET/FALTAS */}
                <View style={styles.section}>
                  <TouchableOpacity
                    style={styles.circleButton}
                    onPress={async () => {
                      setSetFaltasA((prev) => (prev >= 20 ? 0 : prev + 1));
                      await sendCmd(0x06); // comando -1 ponto A
                    }}
                  />
                  <Text style={styles.info}>SET/FALTAS</Text>
                </View>

                {/* SERVIÇO e TEMPO */}
                <View style={styles.row}>
                  <View style={styles.section}>
                    <TouchableOpacity
                      style={styles.circleButton}
                      onPress={async () => {
                        setServicoA(servicoA === "S" ? "N" : "S");
                        await sendCmd(0x05); // comando -1 ponto A
                      }}
                    />
                    <Text style={styles.info}>SERV</Text>
                  </View>
                  <View style={styles.section}>
                    <TouchableOpacity
                      style={styles.circleButton}
                      onPress={async () => {
                        setPedidoTempoA((prev) => (prev >= 2 ? 0 : prev + 1));
                        await sendCmd(0x04);
                      }}
                    />
                    <Text style={styles.info}>P. TEMP</Text>
                  </View>
                </View>

                {/* +1 e -1 PONTOS */}
                <View style={styles.row}>
                  <View style={styles.section}>
                    <TouchableOpacity
                      style={styles.circleButton}
                      onPress={async () => {
                        setPontosA((prev) => (prev >= 199 ? 0 : prev + 1));
                        await sendCmd(0x01); // comando +1 ponto A
                      }}
                    />
                    <Text style={styles.info}>+1</Text>
                  </View>
                  <Text style={styles.pointsTitle}>PONTOS</Text>
                  <View style={styles.section}>
                    <TouchableOpacity
                      style={styles.circleButton}
                      onPress={async () => {
                        setPontosA((prev) => (prev > 0 ? prev - 1 : prev));
                        await sendCmd(0x02); // comando -1 ponto A
                      }}
                    />
                    <Text style={styles.info}>-1</Text>
                  </View>
                </View>
              </View>
              {/* _____________________________________________________________________________________*/}
              {/* Equipe B */}
              <View
                style={[styles.teamContainer, { width: "90%", marginTop: 5 }]}
              >
                <Text style={styles.teamName}>EQUIPE B</Text>

                {/* SET/FALTAS */}
                <View style={styles.section}>
                  <TouchableOpacity
                    style={styles.circleButton}
                    onPress={async () => {
                      setSetFaltasB((prev) => (prev >= 20 ? 0 : prev + 1));
                      await sendCmd(0x07);
                    }}
                  />
                  <Text style={styles.info}>SET/FALTAS</Text>
                </View>

                {/* SERVIÇO e TEMPO */}
                <View style={styles.row}>
                  <View style={styles.section}>
                    <TouchableOpacity
                      style={styles.circleButton}
                      onPress={async () => {
                        setServicoB(servicoB === "S" ? "N" : "S");
                        await sendCmd(0x08);
                      }}
                    />
                    <Text style={styles.info}>SERV</Text>
                  </View>
                  <View style={styles.section}>
                    <TouchableOpacity
                      style={styles.circleButton}
                      onPress={async () => {
                        setPedidoTempoB((prev) => (prev >= 2 ? 0 : prev + 1));
                        await sendCmd(0x09);
                      }}
                    />
                    <Text style={styles.info}>P. TEMP</Text>
                  </View>
                </View>

                {/* +1 e -1 PONTOS */}
                <View style={styles.row}>
                  <View style={styles.section}>
                    <TouchableOpacity
                      style={styles.circleButton}
                      onPress={async () => {
                        setPontosB((prev) => (prev >= 199 ? 0 : prev + 1));
                        await sendCmd(0x03);
                      }}
                    />
                    <Text style={styles.info}>+1</Text>
                  </View>
                  <Text style={styles.pointsTitle}>PONTOS</Text>
                  <View style={styles.section}>
                    <TouchableOpacity
                      style={styles.circleButton}
                      onPress={async () => {
                        setPontosB((prev) => (prev > 0 ? prev - 1 : prev));
                        await sendCmd(0x0a);
                      }}
                    />
                    <Text style={styles.info}>-1</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.geralContainer1}>
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.circleButton1}
              onPress={async () => {
                setIsRunning((r) => !r);
                await sendCmd(0x0b);
              }}
            />
            <Text style={styles.info2}>CRONÔMETRO</Text>
            <TouchableOpacity
              onPress={() => setPresetMenuOpen(!presetMenuOpen)}
            >
              <Text style={styles.circleButtonp}></Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.circleButton2}
                onPress={async () => {
                  setAlarme(alarme === "Ligado" ? "Desligado" : "Ligado");
                  await sendCmd(0x0c);
                }}
              />
              <Text style={styles.info3}>ALARME</Text>
            </View>
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.circleButton2}
                onPress={async () => {
                  //zerar tudo
                  resetarPlacar();
                  await sendCmd(0x0d);
                }}
              />
              <Text style={styles.info3}>RESET</Text>
            </View>
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.circleButton2}
                onPress={handlePeriodoPress}
              />
              <Text style={styles.info3}>PERÍODO</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PlacarEletronico;
