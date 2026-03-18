import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  const value = useMemo(() => {
    const login = (newToken) => {
      localStorage.setItem("token", newToken);
      setToken(newToken);
    };
    const logout = () => {
      localStorage.removeItem("token");
      setToken("");
    };
    return { token, login, logout };
  }, [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

