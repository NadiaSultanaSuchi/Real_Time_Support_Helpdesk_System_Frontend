import axios from "axios";
import { getAccessToken, logout } from "./auth";

export const api = axios.create({ baseURL: "http://127.0.0.1:3000/api" });

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);