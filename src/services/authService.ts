// src/services/authService.ts
import Cookies from "js-cookie";
import apiClient, { TOKEN_COOKIE_KEY } from "./apiClient";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

const USER_STORAGE_KEY = "auth_user";

export const signup = async (
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>("auth/signup/", {
    email,
    password,
    name,
  });

  const data = res.data;

  // Store token in cookie
  Cookies.set(TOKEN_COOKIE_KEY, data.token, {
    expires: 7, // 7 days
    sameSite: "lax",
  });

  // Optional: store user in localStorage for reload
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));

  return data;
};

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>("auth/login/", {
    email,
    password,
  });

  const data = res.data;

  Cookies.set(TOKEN_COOKIE_KEY, data.token, {
    expires: 7,
    sameSite: "lax",
  });

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));

  return data;
};

export const forgotPassword = async (email: string): Promise<void> => {
  await apiClient.post("auth/forgot-password/", { email });
};

export const logout = () => {
  Cookies.remove(TOKEN_COOKIE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};

export const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const getStoredToken = (): string | null => {
  return Cookies.get(TOKEN_COOKIE_KEY) ?? null;
};
