import axios from 'axios';
import { Platform } from 'react-native';

// No Android, localhost é acessível através do IP 10.0.2.2
const baseURL = Platform.select({
    android: 'http://192.168.1.41:3000/api',
    ios: 'http://localhost:3000/api',
    default: 'http://localhost:3000/api',
});

const api = axios.create({
    baseURL,
    timeout: 10000,
});

export default api;