import Constants from "expo-constants";

export const API_URL =
  // Constants.manifest?.extra?.apiUrl ?? "http://172.30.0.12:3000";
  Constants.expoConfig?.extra?.apiUrl ?? "https://arenacontrol.linceonline.com.br";

// `http://10.0.2.2:3000/auth/${endpoint}`;
