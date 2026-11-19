import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8081', // Ajusta se o teu back-end rodar noutra porta
});

// antes de qualquer requisição sair, ele injeta o token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});