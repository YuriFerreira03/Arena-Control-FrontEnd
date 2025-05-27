import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { useBLEContext } from "../hooks/BLEContext";

import Header from "../components/Header";
import HomeButton from "../components/HomeButton";
import { colors } from "../theme/colors";

const ConnectionBT = ({ navigation }) => {
  const {
    allDevices,
    connectToDevice,
    requestPermissions,
    scanning,
    scanForPeripherals,
    stopScan,
    selectedDevice,
    disconnectFromDevice,
  } = useBLEContext();

  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    scanForDevices();
  }, []);

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      setIsScanning(true);
      scanForPeripherals();
      setTimeout(() => {
        setIsScanning(false);
        stopScan();
      }, 5000);
    }
  };

  const handleRescan = async () => {
    await disconnectFromDevice();
    scanForDevices();
  };

  const connectToSelectedDevice = async (device) => {
    await connectToDevice(device);
    Alert.alert(
      "Dispositivo Conectado",
      `Você está conectado a ${device.name}`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Conecte ao Placar Eletrônico</Text>

        {selectedDevice ? (
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceText}>
              ✅ Conectado a: {selectedDevice.name}
            </Text>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => navigation.navigate("PlacarEletronico")}
            >
              <Text style={styles.buttonText}>Ir para Placar Eletrônico</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.scanButton} onPress={handleRescan}>
              <Text style={styles.buttonText}>Procurar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={scanForDevices}
            >
              <Text style={styles.buttonText}>
                {isScanning ? "Escaneando..." : "Procurar Dispositivos"}
              </Text>
            </TouchableOpacity>

            {isScanning && (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={styles.loader}
              />
            )}

            <FlatList
              data={allDevices}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.deviceItem}
                  onPress={() => connectToSelectedDevice(item)}
                >
                  <Text style={styles.deviceName}>
                    {item.name || "Dispositivo Desconhecido"}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </>
        )}

        <HomeButton navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.primary },
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: colors.primary,
    marginTop: 20,
    marginBottom: 20,
  },
  scanButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
    width: 280,
    alignSelf: "center",
  },
  nextButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
    width: 280,
    alignSelf: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loader: {
    marginVertical: 20,
  },
  deviceItem: {
    backgroundColor: "#F5F7FA",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    textAlign: "center",
  },
  deviceInfo: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: "#F5F7FA",
    padding: 20,
    borderRadius: 20,
  },
  deviceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 10,
  },
});

export default ConnectionBT;
