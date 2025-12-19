// src/services/apiClient.ts
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = "http://127.0.0.1:8000/api/";

export const TOKEN_COOKIE_KEY = "auth_token";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token from cookie on every request
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get(TOKEN_COOKIE_KEY);
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Optional: global error interceptor if you want
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // handle 401, etc
//     return Promise.reject(error);
//   }
// );

export default apiClient;
