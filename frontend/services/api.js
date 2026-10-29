import axios from "axios";

// Cliente HTTP que utilizara el Frontend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

// Adjunta el JWT automaticamente siempre y cuando exista una sesion.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("potionlab-token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
