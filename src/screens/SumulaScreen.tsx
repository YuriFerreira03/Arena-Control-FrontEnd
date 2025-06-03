// screens/SumulaScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from "react-native";
import {
  TextInput,
  Button,
  IconButton,
  HelperText,
  Menu,
} from "react-native-paper";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import API from "../service/api";
import { ActivityIndicator } from "react-native-paper";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import DateTimePicker from "@react-native-community/datetimepicker";
import Header from "../components/Header";
import HomeButton from "../components/HomeButton";
import { colors } from "../theme/colors";
import { buildSumulaHtml } from "../utils/pdfTemplate";
import { DevSettings } from "react-native";
import VisualizarJogos from "../components/ViewGames";

/* ─── Tipagens ─── */
interface SumulaScreenProps {
  navigation: { navigate: (s: string, p?: any) => void; goBack: () => void };
}
type PeriodLabel = "1º Tempo" | "2º Tempo" | "Prorrog";
interface PeriodData {
  period: PeriodLabel;
  goalsA: string;
  goalsB: string;
  foulsA: string;
  foulsB: string;
  timeoutsA: string;
  timeoutsB: string;
}

interface Player {
  number: string;
  name: string;
  yellow: boolean;
  red: boolean;
}

interface FormData {
  sport: string;
  competition: string;
  category: string;
  venue: string;
  date: string;
  city: string;
  teamA: string;
  teamB: string;
  referee: string;
  periods: PeriodData[];
  playersA: Player[];
  playersB: Player[];
  notes: string;
  data_hora?: Date;
}

interface JogoDto {
  id_jogo: number;
  equipe_a: string;
  equipe_b: string;
  data_hora: string;
  nome_jogo?: string;
}

/* ───────────────────────────────────────────── */
export default function SumulaScreen({ navigation }: SumulaScreenProps) {
  const [jogos, setJogos] = useState<JogoDto[]>([]);
  const [jogoSel, setJogoSel] = useState<JogoDto | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPickerIOS, setShowPickerIOS] = useState(false);
  const [sumulas, setSumulas] = useState<FormDataWithId[]>([]);
  const [sumulaSel, setSumulaSel] = useState<FormDataWithId | null>(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [showSumulas, setShowSumulas] = useState(false);
  const [showJogos, setShowJogos] = useState(false);

  const formatDateTime = (dateInput?: string | Date) => {
    if (!dateInput) return "Selecione data e hora";

    let d;
    if (typeof dateInput === "string") {
      const parts = dateInput.split("/");
      if (parts.length === 3) {
        d = new Date(+parts[2], +parts[1] - 1, +parts[0]);
      } else {
        d = new Date(dateInput); // tentar ISO
      }
    } else {
      d = dateInput;
    }

    // console.log("d =>", d);
    if (!(d instanceof Date) || isNaN(d.getTime())) return "Data inválida";

    return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const openDateTimePickerAndroid = (
    onChange: (date: Date) => void,
    currentDate: Date
  ) => {
    // Primeiro escolhe a DATA
    DateTimePickerAndroid.open({
      value: currentDate || new Date(),
      mode: "date",
      is24Hour: true,
      onChange: (event, selectedDate) => {
        if (event.type === "set" && selectedDate) {
          // Depois abre o HORA
          DateTimePickerAndroid.open({
            value: selectedDate,
            mode: "time",
            is24Hour: true,
            onChange: (e, selectedTime) => {
              if (e.type === "set" && selectedTime) {
                const finalDate = new Date(selectedDate);
                finalDate.setHours(selectedTime.getHours());
                finalDate.setMinutes(selectedTime.getMinutes());
                onChange(finalDate);
              }
            },
          });
        }
      },
    });
  };

  interface FormDataWithId extends FormData {
    id?: number;
  }

  /* ─── React-Hook-Form ─── */
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      sport: "Futsal",
      competition: "",
      category: "",
      venue: "",
      date: "",
      city: "",
      teamA: "",
      teamB: "",
      referee: "",
      periods: [
        {
          period: "1º Tempo",
          goalsA: "",
          goalsB: "",
          foulsA: "",
          foulsB: "",
          timeoutsA: "",
          timeoutsB: "",
        },
        {
          period: "2º Tempo",
          goalsA: "",
          goalsB: "",
          foulsA: "",
          foulsB: "",
          timeoutsA: "",
          timeoutsB: "",
        },
        {
          period: "Prorrog",
          goalsA: "",
          goalsB: "",
          foulsA: "",
          foulsB: "",
          timeoutsA: "",
          timeoutsB: "",
        },
      ],
      playersA: [],
      playersB: [],
      notes: "",
    },
  });

  const { fields: periodFields } = useFieldArray({ control, name: "periods" });
  const {
    fields: playersA,
    append: appendPlayerA,
    remove: removePlayerA,
  } = useFieldArray({ control, name: "playersA" });
  const {
    fields: playersB,
    append: appendPlayerB,
    remove: removePlayerB,
  } = useFieldArray({ control, name: "playersB" });

  /* ─── submit ─── */
  const onSubmit = async (form: FormDataWithId) => {
    try {
      setSaving(true);

      const payload = {
        esporte: form.sport,
        competicao: form.competition,
        categoria: form.category,
        local: form.venue,
        cidade: form.city,
        equipeA: form.teamA,
        equipeB: form.teamB,
        arbitro: form.referee,
        observacoes: form.notes,
        fk_jogo_id_jogo: jogoSel?.id_jogo ?? null,
        data_hora: form.date ? new Date(form.date).toISOString() : null,

        periodos: form.periods.map((p) => ({
          golsA: +p.goalsA || 0,
          golsB: +p.goalsB || 0,
          faltasA: +p.foulsA || 0,
          faltasB: +p.foulsB || 0,
          temposA: +p.timeoutsA || 0,
          temposB: +p.timeoutsB || 0,
        })),

        jogadoresA: form.playersA.map((p) => ({
          nome: p.name,
          numero: p.number,
          amarelo: Number(p.yellow) || 0,
          vermelho: p.red ?? false,
        })),

        jogadoresB: form.playersB.map((p) => ({
          nome: p.name,
          numero: p.number,
          amarelo: Number(p.yellow) || 0,
          vermelho: p.red ?? false,
        })),
      };

      console.log("PAYLOAD ENVIADO =>", payload);

      if (form.id) {
        await API.patch(`/sumula/${form.id}`, payload);
      } else {
        await API.post("/sumula", payload);
      }

      alert("Súmula salva!");
      reset();
      setSumulaSel(null);
      setModalVisivel(false);
      const { data } = await API.get("/sumula/minhas");
      setSumulas(data);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar súmula");
    } finally {
      setSaving(false);
      navigation.navigate("Sumula");
    }
  };

  /* ─── helpers ─── */
  const renderPeriodRow = (index: number, p: PeriodData) => (
    <View key={p.period} style={styles.periodRow}>
      <Text style={styles.periodLabel}>{p.period}</Text>

      <Controller
        control={control}
        name={`periods.${index}.goalsA`}
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInput
            onChangeText={onChange}
            value={value}
            mode="outlined"
            label="GA"
            keyboardType="numeric"
            style={styles.periodInput}
          />
        )}
      />
      <Controller
        control={control}
        name={`periods.${index}.goalsB`}
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInput
            onChangeText={onChange}
            value={value}
            mode="outlined"
            label="GB"
            keyboardType="numeric"
            style={styles.periodInput}
          />
        )}
      />
      <Controller
        control={control}
        name={`periods.${index}.foulsA`}
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInput
            onChangeText={onChange}
            value={value}
            mode="outlined"
            label="FA"
            keyboardType="numeric"
            style={styles.periodInput}
          />
        )}
      />
      <Controller
        control={control}
        name={`periods.${index}.foulsB`}
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInput
            onChangeText={onChange}
            value={value}
            mode="outlined"
            label="FB"
            keyboardType="numeric"
            style={styles.periodInput}
          />
        )}
      />
      <Controller
        control={control}
        name={`periods.${index}.timeoutsA`}
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInput
            onChangeText={onChange}
            value={value}
            mode="outlined"
            label="T.O. A"
            keyboardType="numeric"
            style={styles.periodInput}
          />
        )}
      />
      <Controller
        control={control}
        name={`periods.${index}.timeoutsB`}
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInput
            onChangeText={onChange}
            mode="outlined"
            value={value}
            label="T.O. B"
            keyboardType="numeric"
            style={styles.periodInput}
          />
        )}
      />
    </View>
  );

  const renderPlayerRow = (
    side: "A" | "B",
    players: Player[],
    append: (p: Player) => void,
    remove: (i: number) => void
  ) => (
    <View style={styles.playersBlock}>
      <Text style={styles.sectionSubTitle}>Equipe {side}</Text>

      {players.map((pl, idx) => (
        <View key={pl.id ?? idx} style={styles.playerRow}>
          <Controller
            control={control}
            name={`players${side}.${idx}.number`}
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                onChangeText={onChange}
                mode="outlined"
                value={value}
                placeholder="Nº"
                style={[styles.playerInput, { width: 60 }]}
                keyboardType="numeric"
              />
            )}
          />
          <Controller
            control={control}
            name={`players${side}.${idx}.name`}
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                onChangeText={onChange}
                mode="outlined"
                value={value}
                placeholder="Nome"
                style={[styles.playerInput, { flex: 1 }]}
              />
            )}
          />
          <Controller
            control={control}
            name={`players${side}.${idx}.yellow`}
            defaultValue={0}
            render={({ field }) => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <IconButton
                  icon="card"
                  onPress={() => {
                    const current = field.value || 0;
                    const next = current >= 3 ? 0 : current + 1;
                    field.onChange(next);
                  }}
                  containerColor={field.value > 0 ? "#FFC107" : undefined}
                />
                <Text style={{ fontSize: 14, marginLeft: 4 }}>
                  {field.value || 0}x
                </Text>
              </View>
            )}
          />

          <Controller
            control={control}
            name={`players${side}.${idx}.red`}
            defaultValue={false}
            render={({ field }) => (
              <IconButton
                icon={field.value ? "flag" : "flag-outline"}
                onPress={() => field.onChange(!field.value)}
                containerColor={field.value ? "#F44336" : undefined}
              />
            )}
          />

          <IconButton icon="close" onPress={() => remove(idx)} />
        </View>
      ))}

      <Button
        mode="outlined"
        style={styles.addPlayerButton}
        onPress={() =>
          append({ number: "", name: "", yellow: false, red: false })
        }
      >
        Adicionar Atleta
      </Button>
    </View>
  );

  useEffect(() => {
    const fetchJogos = async () => {
      try {
        const res = await API.get("/jogos/jogados/lista");
        setJogos(res.data);
      } catch (err) {
        console.error("Erro ao buscar jogos:", err);
      }
    };

    const fetchSumulas = async () => {
      try {
        const res = await API.get("/sumula/minhas");
        const mapped = res.data.map((s: any) => ({
          ...s,
          id: s.id_sumula,
        }));
        setSumulas(mapped);
      } catch (err) {
        console.error("Erro ao buscar súmulas:", err);
      }
    };

    fetchJogos();
    fetchSumulas();
  }, []);

  const exportarPdf = async (dados: FormDataWithId) => {
    try {
      // chama o seu template para gerar o HTML completo
      const html = buildSumulaHtml(dados);

      // imprime para arquivo
      const { uri } = await Print.printToFileAsync({ html });

      // compartilha
      await Sharing.shareAsync(uri);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Falha ao gerar PDF");
    }
  };

  async function fetchPlacarEPreencher(jogoId: number) {
    try {
      const res = await API.get<PlacarDto[]>(`/placar/jogo/${jogoId}`);
      /* pegue só o mais recente de cada período */
      const mapa = new Map<number, PlacarDto>();
      res.data
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .forEach((p) => {
          if (!mapa.has(p.periodo)) mapa.set(p.periodo, p);
        });

      Array.from(mapa.values()).forEach((p) => {
        const idx = (p.periodo ?? 1) - 1; // 1→0, 2→1, 3→2
        /* pontos = gols  */
        setValue(`periods.${idx}.goalsA`, String(p.pontos_time_a ?? ""));
        setValue(`periods.${idx}.goalsB`, String(p.pontos_time_b ?? ""));
        /* faltas */
        setValue(`periods.${idx}.foulsA`, String(p.set_faltas_a ?? ""));
        setValue(`periods.${idx}.foulsB`, String(p.set_faltas_b ?? ""));
        /* tempos */
        setValue(`periods.${idx}.timeoutsA`, String(p.pedido_tempo_a ?? ""));
        setValue(`periods.${idx}.timeoutsB`, String(p.pedido_tempo_b ?? ""));
      });
    } catch {
      Alert.alert("Erro", "Não foi possível carregar o placar.");
    }
  }

  /* ─── UI ─── */
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              {/* Título */}
              <Text style={styles.modalTitle}>
                Súmula: {sumulaSel?.teamA} x {sumulaSel?.teamB}
              </Text>

              {/* Dados gerais */}
              <View style={styles.modalSection}>
                <Text>
                  <Text style={styles.bold}>Competição:</Text>{" "}
                  {sumulaSel?.competition || "-"}
                </Text>
                <Text>
                  <Text style={styles.bold}>Categoria:</Text>{" "}
                  {sumulaSel?.category || "-"}
                </Text>
                <Text>
                  <Text style={styles.bold}>Data:</Text>{" "}
                  {sumulaSel?.date ? formatDateTime(sumulaSel.date) : "-"}
                </Text>
                <Text>
                  <Text style={styles.bold}>Local:</Text>{" "}
                  {sumulaSel?.venue || "-"}
                </Text>
                <Text>
                  <Text style={styles.bold}>Árbitro:</Text>{" "}
                  {sumulaSel?.referee || "-"}
                </Text>
                <Text>
                  <Text style={styles.bold}>Resultado Final:</Text>{" "}
                  {sumulaSel?.periods.reduce(
                    (acc, p) => acc + Number(p.goalsA),
                    0
                  )}{" "}
                  x{" "}
                  {sumulaSel?.periods.reduce(
                    (acc, p) => acc + Number(p.goalsB),
                    0
                  )}
                </Text>
              </View>

              {/* Períodos */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionSubTitle}>Divisão por Tempo</Text>
                <View style={styles.periodHeader}>
                  <Text style={[styles.periodLabel, { flex: 2 }]}>Período</Text>
                  <Text style={styles.periodCol}>GA</Text>
                  <Text style={styles.periodCol}>GB</Text>
                  <Text style={styles.periodCol}>FA</Text>
                  <Text style={styles.periodCol}>FB</Text>
                  <Text style={styles.periodCol}>T.O A</Text>
                  <Text style={styles.periodCol}>T.O B</Text>
                </View>
                {sumulaSel?.periods.map((p) => (
                  <View key={p.period} style={styles.periodRow}>
                    <Text style={[styles.periodLabel, { flex: 2 }]}>
                      {p.period}
                    </Text>
                    <Text style={styles.periodCol}>{p.goalsA}</Text>
                    <Text style={styles.periodCol}>{p.goalsB}</Text>
                    <Text style={styles.periodCol}>{p.foulsA}</Text>
                    <Text style={styles.periodCol}>{p.foulsB}</Text>
                    <Text style={styles.periodCol}>{p.timeoutsA}</Text>
                    <Text style={styles.periodCol}>{p.timeoutsB}</Text>
                  </View>
                ))}
                {sumulaSel && (
                  <View style={styles.periodRow}>
                    <Text
                      style={[
                        styles.periodLabel,
                        { flex: 2, fontWeight: "700" },
                      ]}
                    >
                      Total
                    </Text>
                    <Text style={styles.periodCol}>
                      {sumulaSel.periods.reduce(
                        (sum, p) => sum + Number(p.goalsA),
                        0
                      )}
                    </Text>
                    <Text style={styles.periodCol}>
                      {sumulaSel.periods.reduce(
                        (sum, p) => sum + Number(p.goalsB),
                        0
                      )}
                    </Text>
                    <Text style={styles.periodCol}>
                      {sumulaSel.periods.reduce(
                        (sum, p) => sum + Number(p.foulsA),
                        0
                      )}
                    </Text>
                    <Text style={styles.periodCol}>
                      {sumulaSel.periods.reduce(
                        (sum, p) => sum + Number(p.foulsB),
                        0
                      )}
                    </Text>
                    <Text style={styles.periodCol}>
                      {sumulaSel.periods.reduce(
                        (sum, p) => sum + Number(p.timeoutsA),
                        0
                      )}
                    </Text>
                    <Text style={styles.periodCol}>
                      {sumulaSel.periods.reduce(
                        (sum, p) => sum + Number(p.timeoutsB),
                        0
                      )}
                    </Text>
                  </View>
                )}
              </View>

              {/* Atletas A */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionSubTitle}>Atletas – Equipe A</Text>
                {sumulaSel?.playersA.map((p, i) => (
                  <Text key={i} style={styles.playerLine}>
                    {p.number} – {p.name}{" "}
                    {p.yellow > 0 && (
                      <Text style={styles.yellowCard}>🟨 {p.yellow}x</Text>
                    )}
                    {p.red && <Text style={styles.redCard}>🟥</Text>}
                  </Text>
                ))}
              </View>

              {/* Atletas B */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionSubTitle}>Atletas – Equipe B</Text>
                {sumulaSel?.playersB.map((p, i) => (
                  <Text key={i} style={styles.playerLine}>
                    {p.number} – {p.name}{" "}
                    {p.yellow > 0 && (
                      <Text style={styles.yellowCard}>🟨 {p.yellow}x</Text>
                    )}
                    {p.red && <Text style={styles.redCard}>🟥</Text>}
                  </Text>
                ))}
              </View>

              {/* Observações */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionSubTitle}>Observações</Text>
                <Text>{sumulaSel?.notes || "-"}</Text>
              </View>

              {/* Botões */}
              <View style={styles.modalButtons}>
                <Button
                  mode="contained"
                  buttonColor={colors.primary}
                  textColor="#FFF"
                  style={styles.modalButton}
                  onPress={() => exportarPdf(sumulaSel!)}
                >
                  PDF
                </Button>
                <Button
                  mode="outlined"
                  textColor={colors.primary}
                  style={styles.modalButton}
                  onPress={() => setModalVisivel(false)}
                >
                  Fechar
                </Button>
                <Button
                  mode="contained"
                  buttonColor={colors.primary}
                  textColor="#FFF"
                  style={styles.modalButton}
                  onPress={() => {
                    setModalVisivel(false);
                    /* fluxo de editar já está tratado */
                  }}
                >
                  Editar
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.container}>
        <VisualizarJogos
          jogos={jogos}
          show={showJogos}
          onToggle={() => setShowJogos((prev) => !prev)}
          onSelect={async (item) => {
            setShowJogos(false);
            setJogoSel(item);

            setValue("teamA", item.nome_time_a);
            setValue("teamB", item.nome_time_b);
            setValue("date", new Date(item.data_hora));
            setValue("competition", item.nome_jogo ?? "");

            await fetchPlacarEPreencher(item.id_jogo);
          }}
        />

        <Button
          mode="outlined"
          style={styles.saveButton}
          labelStyle={styles.buttonLabel}
          onPress={() => setShowSumulas(!showSumulas)}
        >
          {showSumulas ? "Ocultar Súmulas" : "Visualizar Súmulas"}
        </Button>
        {showSumulas && (
          <FlatList
            horizontal
            data={sumulas}
            keyExtractor={(item) => item.id_sumula.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.sumulaCard}
                onPress={() => {
                  const toForm = {
                    id: item.id_sumula,
                    sport: item.esporte ?? "",
                    competition: item.competicao ?? "",
                    category: item.categoria ?? "",
                    venue: item.local ?? "",
                    date: item.data_hora ? new Date(item.data_hora) : null,
                    city: item.cidade ?? "",
                    teamA: item.equipe_a ?? "",
                    teamB: item.equipe_b ?? "",
                    referee: item.arbitro ?? "",
                    notes: item.observacoes ?? "",
                    periods: [
                      {
                        period: "1º Tempo",
                        goalsA: String(item.gols_1t_a ?? ""),
                        goalsB: String(item.gols_1t_b ?? ""),
                        foulsA: String(item.faltas_1t_a ?? ""),
                        foulsB: String(item.faltas_1t_b ?? ""),
                        timeoutsA: String(item.tempos_1t_a ?? ""),
                        timeoutsB: String(item.tempos_1t_b ?? ""),
                      },
                      {
                        period: "2º Tempo",
                        goalsA: String(item.gols_2t_a ?? ""),
                        goalsB: String(item.gols_2t_b ?? ""),
                        foulsA: String(item.faltas_2t_a ?? ""),
                        foulsB: String(item.faltas_2t_b ?? ""),
                        timeoutsA: String(item.tempos_2t_a ?? ""),
                        timeoutsB: String(item.tempos_2t_b ?? ""),
                      },
                      {
                        period: "Prorrog",
                        goalsA: String(item.gols_prorrog_a ?? ""),
                        goalsB: String(item.gols_prorrog_b ?? ""),
                        foulsA: String(item.faltas_prorrog_a ?? ""),
                        foulsB: String(item.faltas_prorrog_b ?? ""),
                        timeoutsA: String(item.tempos_prorrog_a ?? ""),
                        timeoutsB: String(item.tempos_prorrog_b ?? ""),
                      },
                    ],
                    playersA: (item.jogadores_a as any[]).map((j) => ({
                      name: j.nome,
                      number: j.numero,
                      yellow: j.amarelo,
                      red: j.vermelho,
                    })),
                    playersB: (item.jogadores_b as any[]).map((j) => ({
                      name: j.nome,
                      number: j.numero,
                      yellow: j.amarelo,
                      red: j.vermelho,
                    })),
                  };
                  setSumulaSel(toForm);
                  setModalVisivel(true);
                  reset(toForm);
                }}
              >
                <Text style={styles.sumulaCardTitle}>
                  {item.equipe_a} x {item.equipe_b}
                </Text>
                <Text style={styles.sumulaCardSubtitle}>
                  {item.competicao} • {item.categoria}
                </Text>
                <Text style={styles.sumulaCardDate}>
                  {item.data_hora
                    ? new Date(item.data_hora).toLocaleDateString("pt-BR")
                    : "Sem Data"}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
        {/* ─── Dados gerais ─── */}
        <Text style={styles.sectionTitle}>Dados da Partida</Text>
        <Controller
          control={control}
          name="competition"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              onChangeText={onChange}
              mode="outlined"
              value={value}
              label="Competição"
              style={styles.input}
            />
          )}
        />
        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              onChangeText={onChange}
              mode="outlined"
              value={value}
              label="Categoria / Divisão"
              style={styles.input}
            />
          )}
        />
        <Controller
          control={control}
          name="venue"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              onChangeText={onChange}
              mode="outlined"
              value={value}
              label="Ginásio/Arena"
              style={styles.input}
            />
          )}
        />
        <Controller
          control={control}
          name="city"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              onChangeText={onChange}
              mode="outlined"
              value={value}
              label="Cidade"
              style={styles.input}
            />
          )}
        />
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value } }) => (
            <>
              {Platform.OS === "ios" ? (
                <>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowPickerIOS(!showPickerIOS)}
                  >
                    <Text style={styles.dateButtonText}>
                      {formatDateTime(value)}
                    </Text>
                  </TouchableOpacity>
                  {showPickerIOS && (
                    <DateTimePicker
                      value={value || new Date()}
                      mode="datetime"
                      display="spinner"
                      is24Hour
                      onChange={(event, selected) => {
                        if (event.type === "set" && selected) {
                          onChange(selected);
                        }
                        setShowPickerIOS(false);
                      }}
                    />
                  )}
                </>
              ) : (
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() =>
                    openDateTimePickerAndroid(onChange, value || new Date())
                  }
                >
                  <Text style={styles.dateButtonText}>
                    {formatDateTime(value)}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        />

        {/* ─── Equipes ─── */}
        <Text style={styles.sectionTitle}>Equipes e Placar</Text>
        <Controller
          control={control}
          name="teamA"
          rules={{ required: "Time A é obrigatório" }}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              label="Equipe A"
              mode="outlined"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              style={styles.input}
              error={!!errors.teamB}
            />
          )}
        />
        <HelperText type="error" visible={!!errors.teamA}>
          {errors.teamA?.message}
        </HelperText>
        <Controller
          control={control}
          name="teamB"
          rules={{ required: "Time B é obrigatório" }}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              onChangeText={onChange}
              mode="outlined"
              value={value}
              label="Equipe B"
              style={styles.input}
              error={!!errors.teamB}
            />
          )}
        />
        <HelperText type="error" visible={!!errors.teamB}>
          {errors.teamB?.message}
        </HelperText>
        {/* ─── Períodos ─── */}
        <Text style={styles.sectionTitle}>Divisão por Tempo</Text>
        <View style={styles.periodHeader}>
          <Text style={[styles.periodLabel, { flex: 1.2 }]}></Text>
          <Text style={styles.periodCol}>GA</Text>
          <Text style={styles.periodCol}>GB</Text>
          <Text style={styles.periodCol}>FA</Text>
          <Text style={styles.periodCol}>FB</Text>
          <Text style={styles.periodCol}>T.O A</Text>
          <Text style={styles.periodCol}>T.O B</Text>
        </View>
        {periodFields.map((p, idx) => renderPeriodRow(idx, p as PeriodData))}
        {sumulaSel && (
          <View style={styles.periodHeader}>
            <View style={styles.periodRow}>
              <Text style={styles.periodLabel}>Total</Text>
              <Text style={styles.periodCol}>
                {sumulaSel.periods.reduce(
                  (sum, p) => sum + Number(p.goalsA),
                  0
                )}
              </Text>
              <Text style={styles.periodCol}>
                {sumulaSel.periods.reduce(
                  (sum, p) => sum + Number(p.goalsB),
                  0
                )}
              </Text>
              <Text style={styles.periodCol}>
                {sumulaSel.periods.reduce(
                  (sum, p) => sum + Number(p.foulsA),
                  0
                )}
              </Text>
              <Text style={styles.periodCol}>
                {sumulaSel.periods.reduce(
                  (sum, p) => sum + Number(p.foulsB),
                  0
                )}
              </Text>
              <Text style={styles.periodCol}>
                {sumulaSel.periods.reduce(
                  (sum, p) => sum + Number(p.timeoutsA),
                  0
                )}
              </Text>
              <Text style={styles.periodCol}>
                {sumulaSel.periods.reduce(
                  (sum, p) => sum + Number(p.timeoutsB),
                  0
                )}
              </Text>
            </View>
          </View>
        )}

        {/* ─── Árbitro ─── */}
        <Controller
          control={control}
          name="referee"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              onChangeText={onChange}
              mode="outlined"
              value={value}
              label="Árbitro"
              style={styles.input}
            />
          )}
        />
        {/* ─── Listas de atletas ─── */}
        <Text style={styles.sectionTitle}>Atletas e Cartões</Text>
        {renderPlayerRow(
          "A",
          playersA as Player[],
          appendPlayerA,
          removePlayerA
        )}
        {renderPlayerRow(
          "B",
          playersB as Player[],
          appendPlayerB,
          removePlayerB
        )}
        {/* ─── Observações ─── */}
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              onChangeText={onChange}
              mode="outlined"
              value={value}
              label="Relatório / Observações"
              multiline
              numberOfLines={4}
              style={[styles.input, { height: 100 }]}
            />
          )}
        />
        {/* ─── Salvar ─── */}
        <Button
          mode="contained"
          style={styles.saveButton}
          labelStyle={styles.buttonLabel}
          disabled={saving}
          buttonColor={colors.primary} // Cor de fundo
          onPress={handleSubmit(onSubmit)}
        >
          {saving ? (
            <ActivityIndicator animating={true} color="white" size="small" />
          ) : (
            "Salvar Súmula"
          )}
        </Button>
        {sumulaSel && (
          <Button
            mode="outlined"
            textColor={colors.primary}
            onPress={async () => {
              try {
                await API.delete(`/sumula/${sumulaSel.id}`);
                alert("Excluída!");
                setSumulas((prev) =>
                  prev.filter((s) => s.id_sumula !== sumulaSel.id)
                );
                reset();
                setSumulaSel(null);
                setModalVisivel(false);
                const { data } = await API.get("/sumulas/minhas");
                setSumulas(data);
              } catch (e) {
                // alert("Erro ao excluir");
              } finally {
                navigation.navigate("Sumula");
              }
            }}
          >
            Excluir Súmula
          </Button>
        )}
        <HomeButton navigation={navigation} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ───────────────────────────────────────────── */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.primary },
  container: {
    padding: 20,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    marginVertical: 12,
  },
  sectionSubTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4,
  },
  input: { marginBottom: 12 },
  periodHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  periodRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  periodLabel: { flex: 1.4, fontWeight: "600", color: colors.primary },
  periodCol: {
    flex: 1,
    textAlign: "center",
    fontWeight: "700",
    color: colors.primary,
  },
  periodInput: { flex: 1, marginHorizontal: 2 },
  playersBlock: { marginTop: 12, marginBottom: 20 },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  playerInput: { marginHorizontal: 2 },
  addPlayerButton: { alignSelf: "flex-start", marginTop: 6 },
  saveButton: {
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: colors.primary,
    height: 50,
    width: "80%",
    borderRadius: 10,
    justifyContent: "center",
    alignSelf: "center",
    paddingHorizontal: 40,
  },
  buttonLabel: { fontSize: 16, fontWeight: "bold", color: "#FFF" },
  sumulaTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 10,
  },
  sumulaTagText: { fontWeight: "600" },
  viewSumulasButton: {
    marginVertical: 12,
    alignSelf: "center",
  },
  dateButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  dateButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  sumulaCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    marginLeft: 12,
    marginTop: 12,
    marginRight: 12,
    minWidth: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },

  sumulaCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },

  sumulaCardSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },

  sumulaCardDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },
  modalWrap: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 16,
    textAlign: "center",
  },
  modalSection: {
    marginBottom: 16,
  },
  bold: {
    fontWeight: "700",
  },
  playerLine: {
    fontSize: 14,
    marginVertical: 2,
  },
  yellowCard: {
    color: "#FFC107",
  },
  redCard: {
    color: "#F44336",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
