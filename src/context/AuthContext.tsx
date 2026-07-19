import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string, department: string) => Promise<void>;
  updateSettings: (data: { name?: string; department?: string; password?: string; avatar?: string }) => Promise<void>;
  logout: () => void;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Persistent login on boot
    const storedToken = localStorage.getItem("bh_token");
    const storedUser = localStorage.getItem("bh_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        logout();
      }
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Request failed with status ${response.status}`);
    }

    return response.json();
  };

  const login = async (email: string, password: string) => {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem("bh_token", data.token);
    localStorage.setItem("bh_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string, role: string, department: string) => {
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role, department }),
    });

    localStorage.setItem("bh_token", data.token);
    localStorage.setItem("bh_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const updateSettings = async (settingsData: { name?: string; department?: string; password?: string; avatar?: string }) => {
    const data = await apiFetch("/api/auth/settings", {
      method: "PUT",
      body: JSON.stringify(settingsData),
    });

    localStorage.setItem("bh_token", data.token);
    localStorage.setItem("bh_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("bh_token");
    localStorage.removeItem("bh_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, updateSettings, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
