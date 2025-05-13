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
} from "react-native";
import { useBLEContext } from "../hooks/BLEContext";

const ConnectionBT = ({ navigation }) => {
  const {
    allDevices,
    connectToDevice,
    requestPermissions,
    scanning,
    scanForPeripherals,
    stopScan,
    selectedDevice,
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
      }, 5000); // Escaneia por 5 segundos
    }
  };

  const connectToSelectedDevice = async (device) => {
    await connectToDevice(device);
    Alert.alert(
      "Dispositivo Conectado",
      `Você está conectado a ${device.name}`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Conecte ao Placar Eletrônico</Text>

      {selectedDevice ? (
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceText}>
            Conectado a: {selectedDevice.name}
          </Text>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => navigation.navigate("PlacarEletronico")}
          >
            <Text style={styles.buttonText}>Ir para Placar Eletrônico</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TouchableOpacity style={styles.backButton} onPress={scanForDevices}>
            <Text style={styles.buttonText}>
              {isScanning ? "Escaneando..." : "Procurar Dispositivos"}
            </Text>
          </TouchableOpacity>

          {isScanning && (
            <ActivityIndicator
              size="large"
              color="#023E73"
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

      <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 50,
  },
  scanButton: {
    backgroundColor: "#023E73",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: "#023E73",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  backButton: {
    backgroundColor: "#023E73",
    padding: 20,
    //tamanho do botão
    width: 300,
    //centralizar o botão
    alignSelf: "center",
    //centralizar o texto
    alignItems: "center",
    borderRadius: 80,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loader: {
    marginVertical: 20,
  },
  deviceItem: {
    backgroundColor: "#E0E0E0",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  deviceInfo: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  deviceText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default ConnectionBT;
