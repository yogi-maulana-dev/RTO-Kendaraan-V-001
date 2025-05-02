import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface User {
    user_id: number;
    email: string;
    is_verified: number; // Ubah dari boolean ke number
    // Tambahkan properti lain sesuai kebutuhan
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    token: null,
    login: () => { },
    logout: () => { },
    updateUser: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    // Initialize state from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
    }, []);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('authUser', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

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

export const useAuth = () => useContext(AuthContext);