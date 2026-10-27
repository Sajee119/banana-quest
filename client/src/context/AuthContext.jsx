import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, userApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const status = await authApi.status();
            if (status.authenticated) {
                const data = await userApi.me();
                setUser(data.user);
                setStats(data.stats);
            } else {
                setUser(null);
                setStats(null);
            }
        } catch {
            setUser(null);
            setStats(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const logout = async () => {
        await authApi.logout();
        setUser(null);
        setStats(null);
    };

    return (
        <AuthContext.Provider value={{ user, stats, setStats, loading, refresh, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);