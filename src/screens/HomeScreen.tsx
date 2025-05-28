// src/screens/HomeScreen.tsx
import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Header from "../components/Header";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

interface HomeScreenProps {
  navigation: { navigate: (screen: string, params?: any) => void };
  user: { username: string; e_adm?: boolean } | null;
}

export default function HomeScreen({ navigation, user }: HomeScreenProps) {
  const isAdmin = user?.e_adm === true;

  const handleLogout = useCallback(async () => {
    await AsyncStorage.removeItem("token");
    navigation.navigate("Login");
  }, [navigation]);

  const confirmLogout = () => {
    Alert.alert(
      "Sair",
      "Deseja realmente sair?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sim", onPress: handleLogout },
      ],
      { cancelable: true }
    );
  };

  const buttons = useMemo(() => {
    const list = [
      {
        id: 1,
        label: "Placar",
        icon: "scoreboard",
        onPress: () => navigation.navigate("ConnectionBT"),
      },
      {
        id: 2,
        label: "Súmula",
        icon: "file-document-edit",
        onPress: () => navigation.navigate("Sumula"),
      },
      {
        id: 3,
        label: "Jogos",
        icon: "history",
        onPress: () => navigation.navigate("CreateGame"),
      },
      {
        id: 4,
        label: "Tabela",
        icon: "table-large",
        onPress: () => navigation.navigate("Table"),
      },
    ];

    if (isAdmin) {
      list.push({
        id: 5,
        label: "Cadastrar Usuário",
        icon: "account-plus",
        onPress: () => navigation.navigate("AdmCadastro"),
      });
    }
    list.push({
      id: 6,
      label: "Sair",
      icon: "logout",
      onPress: confirmLogout,
    });

    return list;
  }, [isAdmin, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Arena Control" />

      {/* barra de status */}
      <StatusBar backgroundColor="#003366" barStyle="light-content" />

      <View style={styles.container}>
        {/* cabeçalho */}
        {/* <View style={styles.header}>
          <Image
            source={require("../../assets/logoHD.png")}
            style={styles.logo}
          />
        </View> */}

        {/* grid de botões */}
        <View style={styles.container1}>
          <View style={styles.welcomeBox}>
            <Text style={styles.bv1}>
              <Text style={styles.brandLeft}>Bem-vindo, </Text>
              <Text style={styles.brandRight}>
                {user?.username ?? "Convidado"}!
              </Text>
            </Text>
          </View>
          <View style={styles.buttonGrid}>
            {buttons.map((btn) => (
              <TouchableOpacity
                key={btn.id}
                style={styles.button}
                onPress={btn.onPress}
              >
                <MaterialCommunityIcons
                  name={btn.icon}
                  size={32}
                  color="white"
                />
                <Text style={styles.buttonText}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#003366",
  },
  container: {
    flex: 1,
    backgroundColor: "#003366",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
    resizeMode: "contain",
  },
  bv: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  brandLeft: {
    /* se quiser cores diferentes no texto */
  },
  brandRight: {
    color: "#C8FF57",
  },
  container1: {
    flex: 1,
    width: "100%",
    backgroundColor: "#FFF",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: 20,
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#003366",
    width: "48%",
    aspectRatio: 1, // quadrado
    marginBottom: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  welcomeBox: {
    backgroundColor: "#003366",
    width: "100%",
    height: hp("10%"),
    marginTop: hp("5%"),
    marginBottom: hp("5%"),
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },

  bv1: {
    fontSize: 24,
    color: "#FFF",
    fontFamily: "monospace",
    fontWeight: "bold",
    textAlign: "center",
  },
});
