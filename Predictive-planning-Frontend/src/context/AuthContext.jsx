import { useEffect, useMemo, useState } from "react";
import http from "../api/http";
import AuthContext from "./auth-context";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("token")));

  const fetchMe = async () => {
    try {
      const { data } = await http.get("/auth/me");
      setUser(data.user);
    } catch (error) {
      if (import.meta.env.VITE_USE_MOCK === "true") {
        setUser({ id: "mock-user-1", name: "Planner Pro", email: "admin@n" });
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchMe();
    }
  }, []);

  const login = async (payload) => {
    try {
      const { data } = await http.post("/auth/login", payload);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      return data;
    } catch (error) {
      if (import.meta.env.VITE_USE_MOCK === "true") {
        console.warn("Auth backend unavailable — using mock login.");
        const mockUser = { id: "mock-user-1", name: "Planner Pro", email: payload.email, role: "admin" };
        localStorage.setItem("token", "mock-token-xyz");
        setUser(mockUser);
        return { token: "mock-token-xyz", user: mockUser };
      }
      throw error;
    }
  };

  const register = async (payload) => {
    try {
      const { data } = await http.post("/auth/register", payload);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      return data;
    } catch (error) {
      if (import.meta.env.VITE_USE_MOCK === "true") {
        const mockUser = { id: "mock-user-1", name: "Planner Pro", email: payload.email, role: "admin" };
        localStorage.setItem("token", "mock-token-xyz");
        setUser(mockUser);
        return { token: "mock-token-xyz", user: mockUser };
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh: fetchMe }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
