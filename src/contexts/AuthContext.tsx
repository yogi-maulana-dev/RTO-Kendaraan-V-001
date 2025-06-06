import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

// Definisi struktur User
interface User {
    user_id: number;
    email: string;
    is_verified: number; // atau boolean sesuai backend kamu
    // Tambahkan properti lain sesuai kebutuhan
}

// Definisi struktur AuthContext
interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (updatedUser: Partial<User>) => void;
}

// Buat Context default
const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    token: null,
    login: () => { },
    logout: () => { },
    updateUser: () => { },
});

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');

        if (storedToken) {
            setToken(storedToken);
        }

        if (storedUser && storedUser !== 'undefined') { // <- Tambahkan pengecekan ini
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem('authUser');
                setUser(null);
                setIsAuthenticated(false);
            }
        } else {
            // Kalau kosong atau 'undefined', pastikan state reset
            localStorage.removeItem('authUser');
            setUser(null);
            setIsAuthenticated(false);
        }
    }, []);


    // Method login
    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('authUser', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        setIsAuthenticated(true);
    };

    // Method logout
    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    // Method update user
    const updateUser = (updatedUser: Partial<User>) => {
        if (user) {
            const mergedUser = { ...user, ...updatedUser };
            localStorage.setItem('authUser', JSON.stringify(mergedUser));
            setUser(mergedUser);
        }
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            token,
            login,
            logout,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook supaya gampang pakai Context
export const useAuth = () => useContext(AuthContext);
