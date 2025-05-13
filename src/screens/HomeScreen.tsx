// HomeScreen.tsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface HomeScreenProps {
  navigation: { navigate: (screen: string, params?: any) => void };
  user: { username: string; e_adm?: boolean } | null;
}

export default function HomeScreen({ navigation, user }: HomeScreenProps) {
  const isAdmin = user?.e_adm === true;

  /* ------------ 2. lista de botões ----------------- */
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
        onPress: () => {},
      },
      { id: 3, label: "Jogos", icon: "history", onPress: () => {} },
      { id: 4, label: "Tabela", icon: "table-large", onPress: () => {} },
    ]; // ⬅️ sem vírgula depois do último item!

    if (isAdmin) {
      list.push({
        id: 99,
        label: "Cadastrar Usuário",
        icon: "account-plus",
        onPress: () => navigation.navigate("AdmCadastro"),
      });
    }
    return list;
  }, [isAdmin, navigation]);

  /* ------------ 3. logout -------------------------- */
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#023E73" barStyle="light-content" />

      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/logoHD.png")}
            style={styles.logo}
          />
          <Text style={styles.bv}>
            <Text style={styles.brandLeft}>Bem-vindo, </Text>
            <Text style={styles.brandRight}>
              {user?.username ?? "Convidado"}!
            </Text>
          </Text>
        </View>

        <View style={styles.container1}>
          <View style={styles.buttonGrid}>
            {buttons.map((btn) => {
              const isCadastro = btn.id === 99;
              return (
                <TouchableOpacity
                  key={btn.id}
                  style={isCadastro ? styles.cadastroButton : styles.button}
                  onPress={btn.onPress}
                >
                  <MaterialCommunityIcons
                    name={btn.icon}
                    size={32}
                    color={isCadastro ? "#003366" : "white"}
                  />
                  <Text
                    style={isCadastro ? styles.cadastroText : styles.buttonText}
                  >
                    {btn.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#023E73",
  },
  container: {
    flex: 1,
    backgroundColor: "#003366",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  headerTitle: {
    color: "#FFFFFF", // parte “Arena” em branco (placa clara)
    textShadowColor: "#003366",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  headerSubtitle: {
    color: "#A0AEC0",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    width: "100%",
    marginTop: -70,
    paddingVertical: 60,
  },
  container1: {
    flex: 1,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    backgroundColor: "#FFFFFF",
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    width: "100%",
  },
  button: {
    backgroundColor: "#003366",
    width: "45%",
    height: 170,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
    fontWeight: "600",
    marginTop: 15,
  },
  bv: {
    fontSize: 25, // grande e chamativo
    fontFamily: "monospace",
    letterSpacing: -1, // lembra dígitos de placar
    marginBottom: -12,
    fontWeight: "bold",
    //centralizar
    marginLeft: 20,
    marginTop: 20,
    textAlign: "center",
    color: "#FFFFFF", // parte “Arena” em branco (placa clara)
  },
  brandRight: {
    color: "#C8FF57", // parte “Control” no verde-limão
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  logoutButton: {
    marginTop: -50,
    padding: 12,
    backgroundColor: "#003366",
    borderRadius: 10,
    width: "50%",
    alignItems: "center",
  },
  logoutText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  cadastroButton: {
    backgroundColor: "#C8FF57",
    borderColor: "#003366",
    borderWidth: 2,
    width: "95%",
    height: 60,
    marginTop: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    alignSelf: "center",
  },
  cadastroText: {
    color: "#003366",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default HomeScreen;
