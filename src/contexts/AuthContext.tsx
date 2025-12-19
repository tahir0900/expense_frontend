// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import {
  signup as signupService,
  login as loginService,
  logout as logoutService,
  getStoredUser,
  getStoredToken,
  AuthUser,
} from "@/services/authService";

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  initializing: boolean; // 🔹 NEW
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true); // 🔹 NEW

  // On first load, restore from cookie/localStorage
  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();

    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUser) {
      setUser(storedUser);
    }

    setInitializing(false); // 🔹 Mark hydration done
  }, []);

  const signup = async (email: string, password: string, name: string) => {
    const data = await signupService(email, password, name);
    setUser(data.user);
    setToken(data.token);
  };

  const login = async (email: string, password: string) => {
    const data = await loginService(email, password);
    setUser(data.user);
    setToken(data.token);
  };

  const logout = () => {
    logoutService();
    setUser(null);
    setToken(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        initializing,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
