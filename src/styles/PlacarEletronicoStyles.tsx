// styles/PlacarEletronicoStyles.ts
import { StyleSheet } from "react-native";
import { colors } from "../theme/colors"; // azul primário #003366

export default StyleSheet.create({
  /* ─── Estrutura base ─── */
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 20,
  },

  /* ─── Blocos das equipes ─── */
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  teamBlock: {
    width: "100%",
    backgroundColor: "#F5F7FA",
    borderRadius: 16,
    padding: 12,
    marginTop: -10,
    alignItems: "center",
  },
  teamTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  pointsDisplay: {
    fontSize: 48,
    fontWeight: "700",
    color: colors.primary,
  },

  /* Pontos +1 / -1 */
  pointsButtons: { flexDirection: "row", marginBottom: 8 },
  bigButton: {
    backgroundColor: colors.primary,
    width: 100,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  bigBtnLabel: { color: "#FFF", fontSize: 22, fontWeight: "700" },

  /* Set/Faltas | Serviço | P. Tempo */
  miscRow: { flexDirection: "row", marginTop: 8 },
  smallCircle: {
    width: 40, // antes 28
    height: 40, // antes 28
    borderRadius: 20, // antes 14
    marginHorizontal: 4,
    backgroundColor: colors.primary,
  },
  miscLabel: { fontSize: 12, color: colors.primary, marginTop: 4 },

  /* ─── Bloco Cronômetro e Controles Gerais ─── */
  generalBlock: { alignItems: "center", marginTop: 5 },
  timer: { fontSize: 48, fontWeight: "700", color: colors.primary },
  generalRow: { flexDirection: "row", marginTop: 12 },
  generalCircle: {
    width: 100,
    height: 80,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  generalLabel: { color: "#FFF", textAlign: "center", fontWeight: "600" },

  /* Botão PRESET */
  presetButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  presetLabel: { color: "#FFF", fontWeight: "600" },

  /* ─── Overlay genérico ─── */
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(1, 13, 35, 0.84)",
  },

  /* ─── Menu lateral ─── */
  sideMenu: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    alignSelf: "center",
  },
  menuItem: {
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderRadius: 12,
    alignItems: "center",
    marginTop: 100,
    width: "80%",
    alignSelf: "center",
    justifyContent: "center",
    marginBottom: -80,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 4,
    elevation: 4,
  },

  menuText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  generalCircle1: {
    width: 210,
    height: 80,
    borderRadius: 25,
    //colocar com aul porem com um efeito para sabeer
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },

  /* ─── Modal Preset ─── */
  presetBox: {
    position: "absolute",
    top: "30%",
    left: "10%",
    right: "10%",
    backgroundColor: "#F5F7FA", // igual aos cards e menus
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },

  presetOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#003366",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  presetSelected: {
    backgroundColor: "#D7E8FF",
    borderColor: colors.primary,
    borderWidth: 2,
    borderRadius: 8,
  },

  confirmButton: {
    backgroundColor: colors.white,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },

  miscButton: {
    width: 105,
    height: 70,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  miscBtnLabel: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
    alignSelf: "center",
  },

  iconInfo: {
    color: "#FFF",
    fontSize: 25,
    fontWeight: "600",
    // fontStyle: "italic",
    marginTop: 10,
    marginBottom: 20,
    marginLeft: -280,
    textAlign: "center",
  },
  menuItem1: {
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderRadius: 12,
    alignItems: "center",
    marginTop: 400,
    width: "30%",
    alignSelf: "center",
    justifyContent: "center",
    marginBottom: -100,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 4,
    elevation: 4,
  },
  viewGamesOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  viewGamesContainer: {
    width: "90%",
    height: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  gameInfo: {
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  gameSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  gameDate: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 2,
  },
  menuSubtext: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  menuButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    // alinahr no centro
    alignSelf: "center",
    marginTop: 20,
    width: "85%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  card: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
    marginBottom: 4,
  },
  gameSubtext: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },
  info: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 2,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  editButton: {
    marginTop: 12,
    backgroundColor: colors.primary, // ou outra cor de destaque
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  infoLabel: {
    // “Pontos:”
    fontWeight: "600",
    marginRight: 6,
    fontSize: 14,
    color: "#333",
  },
  input: {
    // TextInput compacto
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 6,
    minWidth: 60,
    textAlign: "center",
  },
});
