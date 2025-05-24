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
  nome?: string;
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

  // const formatDateTime = (dateInput?: Date | string) => {
  //   if (!dateInput) return "Selecione data e hora";
  //   const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  //   console.log("d =>", d);
  //   if (!(d instanceof Date) || isNaN(d.getTime())) return "Data inválida";
  //   return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   })}`;
  // };
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
          amarelo: p.yellow ?? false,
          vermelho: p.red ?? false,
        })),

        jogadoresB: form.playersB.map((p) => ({
          nome: p.name,
          numero: p.number,
          amarelo: p.yellow ?? false,
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
            defaultValue={false}
            render={({ field: { value, onChange } }) => (
              <IconButton
                icon={value ? "card" : "card-outline"}
                onPress={() => onChange(!value)}
                containerColor={value ? "#FFC107" : undefined}
              />
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
        const res = await API.get("/jogos");
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
    const html = `
     <html>
       <body>
         <h1>Súmula ${dados.teamA} x ${dados.teamB}</h1>
         <pre>${JSON.stringify(dados, null, 2)}</pre>
       </body>
     </html>`;
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

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
          <ScrollView style={styles.modalCard}>
            {/* reaproveite o mesmo JSX que compõe a súmula, ou um resumo */}
            <Text style={styles.modalTitle}>Visualização da Súmula</Text>
            <Text>{JSON.stringify(sumulaSel, null, 2)}</Text>

            <Button
              mode="outlined"
              style={styles.modalButton}
              onPress={() => exportarPdf(sumulaSel!)}
            >
              Gerar PDF
            </Button>
            <Button
              mode="outlined"
              style={styles.modalButton}
              onPress={() => setModalVisivel(false)}
            >
              Fechar
            </Button>
            <Button
              mode="contained"
              style={styles.modalButton}
              onPress={() => {
                setModalVisivel(false);
              }}
            >
              Editar Súmula
            </Button>
          </ScrollView>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.container}>
        <Menu
          visible={menuOpen}
          onDismiss={() => setMenuOpen(false)}
          anchor={
            <Button
              mode="outlined" // 🔥 Mesmo modo dos outros
              onPress={() => setMenuOpen(true)}
              style={styles.saveButton}
              //texto branco
              labelStyle={styles.buttonLabel}
            >
              {jogoSel
                ? `${jogoSel.nome_time_a} x ${jogoSel.nome_time_b} (${
                    jogoSel.data_hora
                      ? new Date(jogoSel.data_hora).toLocaleDateString("pt-BR")
                      : "Sem Data"
                  })`
                : "Escolher Jogo"}
            </Button>
          }
        >
          {jogos.length === 0 ? (
            <Menu.Item title="Nenhum jogo encontrado" disabled />
          ) : (
            jogos.map((j) => (
              <Menu.Item
                key={j.id_jogo}
                onPress={() => {
                  setMenuOpen(false);
                  setJogoSel(j);

                  setValue("teamA", j.nome_time_a);
                  setValue("teamB", j.nome_time_b);
                  setValue(
                    "date",
                    new Date(j.data_hora).toLocaleDateString("pt-BR")
                  );
                  setValue("competition", j.nome_jogo ?? "");
                }}
                title={`${j.nome_time_a} x ${j.nome_time_b} (${new Date(
                  j.data_hora
                ).toLocaleDateString("pt-BR")})`}
              />
            ))
          )}
        </Menu>
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
                style={styles.sumulaTag}
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
                  console.log(
                    "sumulaSel que vai pro modal e pro reset =>",
                    toForm
                  );

                  setSumulaSel(toForm);
                  setModalVisivel(true);
                  reset(toForm);
                }}
              >
                <Text style={styles.sumulaTagText}>
                  {item.teamA} x {item.teamB}
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
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              label="Equipe A"
              mode="outlined"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              style={styles.input}
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
          <Text style={[styles.periodLabel, { flex: 1.4 }]}></Text>
          <Text style={styles.periodCol}>GA</Text>
          <Text style={styles.periodCol}>GB</Text>
          <Text style={styles.periodCol}>FA</Text>
          <Text style={styles.periodCol}>FB</Text>
          <Text style={styles.periodCol}>T.O A</Text>
          <Text style={styles.periodCol}>T.O B</Text>
        </View>
        {periodFields.map((p, idx) => renderPeriodRow(idx, p as PeriodData))}
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
    marginBottom: 8,
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
  modalWrap: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  viewSumulasButton: {
    marginVertical: 12,
    alignSelf: "center",
  },
  modalButton: {
    marginVertical: 6,
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
});
