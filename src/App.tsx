// rodar android : npx expo start --dev-client

import React, { useState, useEffect } from "react";
import { View, StyleSheet, StatusBar, Platform } from "react-native";
import HomeScreen from "./screens/HomeScreen";
import ConnectionBT from "./screens/ConnectionBTScreen";
import PlacarEletronico from "./screens/ElectronicScoreboardScreen";
import LoginScreen from "./screens/LoginScreen";
import AdmCadastroScreen from "./screens/AdmCadastroScreen";
import TableScreen from "./screens/TableScreen";
import CreateGameScreen from "./screens/CreateGameScreen";
import SumulaScreen from "./screens/SumulaScreen";
import { BLEProvider } from "../src/hooks/BLEContext";
import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";

const App = () => {
  const [currentScreen, setCurrentScreen] = useState("Login");
  const [user, setUser] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false); // <-- estado de fontes carregadas

  useEffect(() => {
    Font.loadAsync({
      ...Ionicons.font,
    }).then(() => setFontsLoaded(true));
  }, []);

  const navigateTo = (screen, data) => {
    if (data?.user) setUser(data.user);
    setCurrentScreen(screen);
  };

  const navigation = {
    navigate: navigateTo,
    goBack: () => navigateTo("Home"),
  };

  if (!fontsLoaded) return null; // <-- evita renderizar antes de carregar fontes

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <BLEProvider>
          <View style={styles.container}>
            <StatusBar
              translucent
              backgroundColor="transparent"
              barStyle="light-content"
            />
            <View style={styles.topSection}>
              {currentScreen === "Home" && (
                <HomeScreen navigation={navigation} user={user} />
              )}
              {currentScreen === "ConnectionBT" && (
                <ConnectionBT navigation={navigation} />
              )}
              {currentScreen === "PlacarEletronico" && (
                <PlacarEletronico navigation={navigation} />
              )}
              {currentScreen === "Login" && (
                <LoginScreen navigation={navigation} />
              )}
              {currentScreen === "AdmCadastro" && (
                <AdmCadastroScreen navigation={navigation} />
              )}
              {currentScreen === "Table" && (
                <TableScreen navigation={navigation} />
              )}
              {currentScreen === "CreateGame" && (
                <CreateGameScreen navigation={navigation} />
              )}
              {currentScreen === "Sumula" && (
                <SumulaScreen navigation={navigation} />
              )}
            </View>
            <View style={styles.bottomSection} />
          </View>
        </BLEProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#003366",
  },
  topSection: {
    flex: 1,
  },
});

export default App;
