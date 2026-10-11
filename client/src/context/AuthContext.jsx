import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { authApi } from "@/api/auth";
import { tokenStorage } from "@/api/axios";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // `initializing` covers the brief window on first load where we're
  // checking whether a stored token is still valid, so routes don't
  // flash the login page before we know the answer.
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = tokenStorage.get();
      if (!token) {
        setInitializing(false);
        return;
      }
      try {
        const { data } = await authApi.me();
        setUser(data);
      } catch (_error) {
        tokenStorage.clear();
        setUser(null);
      } finally {
        setInitializing(false);
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { data } = await authApi.login({ email, password });
    tokenStorage.set(data.token);
    setUser(data);
    return data;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const { data } = await authApi.register({ name, email, password });
    tokenStorage.set(data.token);
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (_error) {
      // Even if the network call fails, we still want to clear local
      // state so the user isn't stuck "logged in" on a dead session.
    } finally {
      tokenStorage.clear();
      setUser(null);
    }
  }, []);

  const updateUserInPlace = useCallback((patch) => {
    setUser((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      initializing,
      login,
      register,
      logout,
      updateUserInPlace,
    }),
    [user, initializing, login, register, logout, updateUserInPlace],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
