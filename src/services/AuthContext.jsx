import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [favorites, setFavorites] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // When token changes, save/remove it from localStorage
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
            setUser(null);
        }
    }, [token]);

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        setFavorites(userData.favorites || []);
        navigate('/page'); // Redirect to search page on login
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setFavorites([]);
        navigate('/'); // Redirect to login page on logout
    };

    // This function will call our new API
    const toggleFavorite = async (rom) => {
        if (!token) return; // Not logged in

        try {
            const response = await fetch('http://localhost:3001/api/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(rom)
            });
            const newFavorites = await response.json();
            setFavorites(newFavorites); // Update the global state
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
        }
    };

    // Auto-fetch user's favorites on load if we have a token
    useEffect(() => {
        if (token) {
            const fetchFavorites = async () => {
                const res = await fetch('http://localhost:3001/api/favorites', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const favs = await res.json();
                    setFavorites(favs);
                } else {
                    // Token is bad, log them out
                    logout();
                }
            };
            fetchFavorites();
        }
    }, [token]); // Re-run if token changes

    return (
        <AuthContext.Provider value={{ user, token, favorites, login, logout, toggleFavorite }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);