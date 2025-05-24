import Constants from "expo-constants";

export const API_URL =
  Constants.manifest?.extra?.apiUrl ?? "http://192.168.1.65:3000";

// `http://10.0.2.2:3000/auth/${endpoint}`;
