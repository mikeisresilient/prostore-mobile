import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";

import { API_BASE_URL } from "@/lib/api";

const AUTH_TOKEN_KEY = "prostore-mobile-token";
const AUTH_USER_KEY = "prostore-mobile-user";

export type AuthUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function restoreAuth() {
      try {
        const storedToken =
          await SecureStore.getItemAsync(
            AUTH_TOKEN_KEY
          );

        const storedUser =
          await SecureStore.getItemAsync(
            AUTH_USER_KEY
          );

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error(
          "Failed to restore authentication:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    restoreAuth();
  }, []);

  async function login(
    email: string,
    password: string
  ) {
    const response = await fetch(
      `${API_BASE_URL}/api/mobile/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to log in."
      );
    }

    await SecureStore.setItemAsync(
      AUTH_TOKEN_KEY,
      data.token
    );

    await SecureStore.setItemAsync(
      AUTH_USER_KEY,
      JSON.stringify(data.user)
    );

    setToken(data.token);
    setUser(data.user);
  }

  async function logout() {
    await SecureStore.deleteItemAsync(
      AUTH_TOKEN_KEY
    );

    await SecureStore.deleteItemAsync(
      AUTH_USER_KEY
    );

    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}