import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, formatApiErrorDetail, setAccessToken, getAccessToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // null = checking, false = not logged in, object = user
    const [user, setUser] = useState(null);

    const refresh = useCallback(async () => {
        if (!getAccessToken()) {
            setUser(false);
            return null;
        }
        try {
            const { data } = await api.get("/auth/me");
            setUser(data);
            return data;
        } catch {
            setAccessToken(null);
            setUser(false);
            return null;
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const login = async (email, password) => {
        try {
            const { data } = await api.post("/auth/login", { email, password });
            setAccessToken(data.access_token);
            setUser(data.user);
            return { ok: true };
        } catch (e) {
            return { ok: false, error: formatApiErrorDetail(e.response?.data?.detail) || e.message };
        }
    };

    const logout = async () => {
        setAccessToken(null);
        setUser(false);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, refresh }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
