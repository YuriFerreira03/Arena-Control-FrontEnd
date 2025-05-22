// screens/SumulaScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { TextInput, Button, IconButton, HelperText } from "react-native-paper";
import { useForm, Controller, useFieldArray } from "react-hook-form";

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
}

/* ───────────────────────────────────────────── */
export default function SumulaScreen({ navigation }: SumulaScreenProps) {
  /* ─── React-Hook-Form ─── */
  const {
    control,
    handleSubmit,
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
  const onSubmit = (data: FormData) => {
    console.log("Súmula:", data);
    navigation.goBack();
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
                placeholder="Nome"
                style={[styles.playerInput, { flex: 1 }]}
              />
            )}
          />
          <Controller
            control={control}
            name={`players${side}.${idx}.yellow`}
            render={({ field }) => (
              <IconButton
                icon={field.value ? "card" : "card-outline"}
                size={22}
                onPress={() => field.onChange(!field.value)}
                containerColor={field.value ? "#FFC107" : undefined}
              />
            )}
          />
          <Controller
            control={control}
            name={`players${side}.${idx}.red`}
            render={({ field }) => (
              <IconButton
                icon={field.value ? "flag" : "flag-outline"}
                size={22}
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

  /* ─── UI ─── */
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.container}>
        {/* ─── Dados gerais ─── */}
        <Text style={styles.sectionTitle}>Dados da Partida</Text>

        <Controller
          control={control}
          name="competition"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              onChangeText={onChange}
              mode="outlined"
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
              label="Cidade"
              style={styles.input}
            />
          )}
        />
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              onChangeText={onChange}
              mode="outlined"
              label="Data (dd/mm/aaaa)"
              style={styles.input}
              keyboardType="numeric"
            />
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
          onPress={handleSubmit(onSubmit)}
        >
          Salvar Súmula
        </Button>

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
  buttonLabel: { fontSize: 16, fontWeight: "bold" },
});
