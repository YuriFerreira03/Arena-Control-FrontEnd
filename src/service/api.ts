// services/api.ts
import axios from "axios";
import Constants from "expo-constants";

const baseURL = Constants.manifest?.extra?.apiUrl ?? "http://192.168.1.69:3000";

const API = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
});

export default API;
