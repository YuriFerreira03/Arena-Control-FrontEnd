// rodar android : npx expo start --dev-client --host=lan

import React, { useState, useEffect } from "react";
import { View, StyleSheet, StatusBar, Platform } from "react-native";
import HomeScreen from "./screens/HomeScreen";
import ConnectionBT from "./screens/ConnectionBT";
import PlacarEletronico from "./screens/PlacarEletronico";
import LoginScreen from "./screens/LoginScreen";
import AdmCadastroScreen from "./screens/AdmCadastroScreen";
import { BLEProvider } from "../src/hooks/BLEContext";
import * as Font from "expo-font"; // <-- importar o carregador de fontes
import { Ionicons } from "@expo/vector-icons"; // <-- se estiver usando ícones

const App = () => {
  const [currentScreen, setCurrentScreen] = useState("PlacarEletronico");
  const [user, setUser] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false); // <-- estado de fontes carregadas

  useEffect(() => {
    Font.loadAsync({
      ...Ionicons.font, // <-- garante ícones carregados
      // Adicione aqui outras fontes customizadas, ex:
      // 'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
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
          {currentScreen === "Login" && <LoginScreen navigation={navigation} />}
          {currentScreen === "AdmCadastro" && (
            <AdmCadastroScreen navigation={navigation} />
          )}
        </View>
        <View style={styles.bottomSection} />
      </View>
    </BLEProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003366",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  topSection: {
    flex: 1,
  },
});

export default App;
