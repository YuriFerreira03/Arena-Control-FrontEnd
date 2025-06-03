// services/api.ts
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const baseURL = Constants.manifest?.extra?.apiUrl ?? 'http://192.168.1.69:3000';
const baseURL = Constants.manifest?.extra?.apiUrl ?? 'http://172.30.0.12:3000';

const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
});

API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
