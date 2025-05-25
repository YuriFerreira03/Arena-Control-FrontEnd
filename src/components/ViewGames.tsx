// components/VisualizarJogos.tsx
import React from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { Button } from "react-native-paper";
import { JogoDto } from "../screens/SumulaScreen";
import { colors } from "../theme/colors";

interface Props {
  jogos: JogoDto[];
  show: boolean;
  onToggle: () => void;
  onSelect: (item: JogoDto) => void;
}

export default function VisualizarJogos({
  jogos,
  show,
  onToggle,
  onSelect,
}: Props) {
  return (
    <View>
      <Button
        mode="outlined"
        style={styles.saveButton}
        labelStyle={styles.buttonLabel}
        onPress={onToggle}
      >
        {show ? "Ocultar Jogos" : "Visualizar Jogos"}
      </Button>
      {show && (
        <FlatList
          horizontal
          data={jogos}
          keyExtractor={(item) => item.id_jogo.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.sumulaCard}
              onPress={() => onSelect(item)}
            >
              <Text style={styles.sumulaCardTitle}>
                {item.nome_time_a} x {item.nome_time_b}
              </Text>
              {item.nome_jogo && (
                <Text style={styles.sumulaCardSubtitle}>{item.nome_jogo}</Text>
              )}
              <Text style={styles.sumulaCardDate}>
                {item.data_hora
                  ? new Date(item.data_hora).toLocaleDateString("pt-BR")
                  : "Sem Data"}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
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
});
