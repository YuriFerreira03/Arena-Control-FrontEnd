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
  FlatList,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
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
  const [games, setGames] = useState<any[]>([]);
  const fetchGames = async () => {
    try {
      const token = await AsyncStorage.getItem("token"); // Adicione esta linha
      const res = await API.get("/jogos", {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined, // Inclua o token
        },
      });
      setGames(res.data);
    } catch (e) {
      console.warn("Erro ao buscar jogos", e);
    }
  };
  useEffect(() => {
    fetchGames();
  }, []);

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

  const [showPickerIOS, setShowPickerIOS] = useState(false);

  const formatDateTime = (date: Date) =>
    new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

  const openDatePickerAndroid = (
    onChange: (date: Date) => void,
    currentDate: Date
  ) => {
    DateTimePickerAndroid.open({
      value: currentDate,
      mode: "date",
      is24Hour: true,
      onChange: (event, selectedDate) => {
        if (event.type === "set" && selectedDate) {
          DateTimePickerAndroid.open({
            value: selectedDate,
            mode: "time",
            is24Hour: true,
            onChange: (e, time) => {
              if (e.type === "set" && time) {
                onChange(
                  new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    selectedDate.getDate(),
                    time.getHours(),
                    time.getMinutes()
                  )
                );
              }
            },
          });
        }
      },
    });
  };

  const onSubmit = async (data: FormData) => {
    console.log("[FRONTEND] Dados do formulário:", data);

    try {
      const payload = {
        nome_jogo: data.gameName,
        nome_time_a: data.teamA,
        nome_time_b: data.teamB,
        data_hora: data.gameDate.toISOString(),
      };

      console.log("[FRONTEND] Enviando dados:", payload);
      console.log("[FRONTEND] URL base:", API.defaults.baseURL);

      const token = await AsyncStorage.getItem("token");

      const response = await API.post("/jogos", payload, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      setGames((prev) => [...prev, response.data]);
      reset();
    } catch (err: any) {
      console.error("[FRONTEND] Erro ao salvar jogo:", {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
        method: err.config?.method,
      });

      alert(
        "Erro ao salvar jogo: " +
          (err?.response?.data?.message || "Erro desconhecido")
      );
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
        <Text style={styles.sectionTitle}>Criar Jogo</Text>

        <Controller
          control={control}
          name="gameName"
          rules={{ required: "Informe o nome do jogo" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Nome do Jogo"
              mode="outlined"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
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
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Time A"
              mode="outlined"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
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
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Time B"
              mode="outlined"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
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
                    onPress={() => setShowPickerIOS(!showPickerIOS)}
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
                      onChange={(event, selected) => {
                        if (event.type === "set" && selected)
                          onChange(selected);
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

        <Button
          mode="contained"
          style={styles.saveButton}
          labelStyle={{
            color: colors.white,
            fontSize: 15,
            fontWeight: "bold",
          }}
          onPress={handleSubmit(onSubmit)}
        >
          Salvar Jogo
        </Button>

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
            keyExtractor={(item) => item.id_jogo.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.nome_jogo}</Text>
                <Text>
                  {item.nome_time_a} x {item.nome_time_b}
                </Text>
                <Text style={styles.cardDate}>
                  {formatDateTime(new Date(item.data_hora))}
                </Text>
              </View>
            )}
          />
        )}

        <HomeButton navigation={navigation} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.primary },
  container: {
    padding: 20,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingBottom: 400,
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
    alignItems: "center",
    marginTop: 16,
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
});
