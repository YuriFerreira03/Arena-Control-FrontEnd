import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#02253D",
    padding: 8,
    marginTop: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#003366", // azul escuro CEFET
  },
  mainContainer: {
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "flex-start",
    marginTop: 10,
  },
  teamContainer: {
    backgroundColor: "#06568F", // azul forte bonito
    borderRadius: 20,
    padding: 10,
    margin: 10,
    marginTop: 60,
    marginRight: 50,
    height: 280,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  circleButton: {
    width: 120,
    height: 50,
    marginTop: -10,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    shadowOpacity: 0.8,
    borderColor: "#003366",
    borderWidth: 3,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  circleButton1: {
    width: 290,
    height: 50,
    borderRadius: 20,
    marginTop: -10,
    //cor vermelha
    backgroundColor: "#02253D",
    //contorno branco
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  circleButton2: {
    width: 100,
    height: 50,
    marginTop: -3,
    marginLeft: 10,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderColor: "#003366",
    borderWidth: 3,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  servico: {
    width: "40%",
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    marginTop: -10,
    marginLeft: "31%",
  },
  teamName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 15,
    marginRight: 220,
  },
  section: {
    alignItems: "center",
  },
  info: {
    fontSize: 17,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
    marginTop: -30,
    marginBottom: 2,
  },
  info1: {
    fontSize: 20,
    marginTop: 4,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
  },
  info2: {
    fontSize: 17,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
    marginTop: -3,
    marginBottom: 2,
  },
  info3: {
    fontSize: 17,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
    marginTop: -30,
    marginBottom: 4,
    marginLeft: 10,
  },
  placarResumoContainer: {
    backgroundColor: "#06568F",
    padding: 25,
    marginHorizontal: 11,
  },
  resumoEquipe: {
    backgroundColor: "#02253D",
    borderColor: "#FFFFFF", // Cor da borda
    borderWidth: 1, // Largura da borda
    borderRadius: 15, // Bordas mais arredondadas
    padding: 25, // Mais espaço interno (+10)
    width: "70%", // Largura controlada (quando em linha)
    minHeight: 200, // Altura mínima garantida
    justifyContent: "center", // Centraliza conteúdo verticalmente
    alignItems: "center", // Centraliza horizontalmente
    marginRight: 100, // Espaço entre os resumos
  },
  resumoEquipe2: {
    backgroundColor: "#02253D",
    borderRadius: 15, // Bordas mais arredondadas
    borderColor: "#FFFFFF", // Cor da borda
    borderWidth: 1, // Largura da borda
    padding: 25, // Mais espaço interno (+10)
    width: "70%", // Largura controlada (quando em linha)
    minHeight: 200, // Altura mínima garantida
    justifyContent: "center", // Centraliza conteúdo verticalmente
    alignItems: "center", // Centraliza horizontalmente
  },
  resumoEquipe1: {
    backgroundColor: "#02253D",
    borderRadius: 10,
    padding: 15,
    borderColor: "#FFFFFF", // Cor da borda
    borderWidth: 1, // Largura da borda
    marginTop: 10,
  },
  mainContainer1: {
    marginTop: -10,
  },
  geralContainer: {
    backgroundColor: "#06568F", // azul forte bonito
    borderRadius: 20,
    padding: 20,
    width: 300,
    margin: 40,
    marginTop: 580,
    height: 180,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  geralContainer1: {
    backgroundColor: "#06568F", // azul forte bonito
    borderRadius: 20,
    padding: 20,
    width: "97%",
    marginLeft: 8,
    margin: 40,
    marginTop: 640,
    height: 170,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 8,
  },
  pointsTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: -40,
    marginHorizontal: 10,
  },
  dropdownButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  dropdownContainer: {
    position: "absolute",
    top: 120,
    right: 20,
    borderWidth: 5,
    borderColor: "#FFFFFF",
    backgroundColor: "#06568F",
    borderRadius: 15,
    width: "90%",
    maxHeight: "80%",
    zIndex: 998,
    elevation: 5,
  },
  floatingButton: {
    backgroundColor: "#06568F",
    padding: 12,
    borderRadius: 8,
    borderColor: "#FFFFFF",
    borderWidth: 2,
    minWidth: 110,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  floatingButton1: {
    backgroundColor: "#FF0000",
    padding: 12,
    borderRadius: 8,
    borderColor: "#FFFFFF",
    borderWidth: 2,
    minWidth: 110,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scrollContent: {
    padding: 15,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(2, 37, 61, 0.96)", // Azul #02253D com 70% de opacidade
    zIndex: 997, // Abaixo do dropdown mas acima de outros elementos
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "104%",
    height: 50,
    marginVertical: 3,
    marginTop: 8,
    position: "absolute",
    top: 5,
    zIndex: 999,
  },
  dropdownItem: {
    padding: 40,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  dropdownItemSelected: {
    backgroundColor: "#02253D",
  },
  confirmButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#2196F3",
    borderRadius: 5,
    alignItems: "center",
  },
  circleButtonp: {
    width: 30,
    height: 30,
    marginTop: -69,
    marginLeft: 330,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    shadowOpacity: 0.8,
    borderColor: "#003366",
    borderWidth: 3,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
});

export default styles;
