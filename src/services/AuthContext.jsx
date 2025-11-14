import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [favorites, setFavorites] = useState([]);
    const [recentGames, setRecentGames] = useState([]);

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
        // Navigation will be handled by the component calling login
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setFavorites([]);
        // Navigation will be handled by the component calling logout
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

    // Track when a game is played
    const recordGamePlayed = async (game) => {
        if (!token) return; // Not logged in

        try {
            const response = await fetch('http://localhost:3001/api/recent-games', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(game)
            });
            
            if (!response.ok) {
                const text = await response.text();
                console.error('Server returned:', response.status, text);
                throw new Error(`Server error: ${response.status}`);
            }
            
            const newRecent = await response.json();
            setRecentGames(newRecent); // Update the global state
        } catch (err) {
            console.error('Failed to record game played:', err);
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
                    setToken(null);
                }
            };
            fetchFavorites();
        }
    }, [token]); // Re-run if token changes

    // Auto-fetch user's recent games on load if we have a token
    useEffect(() => {
        if (token) {
            const fetchRecentGames = async () => {
                const res = await fetch('http://localhost:3001/api/recent-games', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const recent = await res.json();
                    setRecentGames(recent);
                }
            };
            fetchRecentGames();
        }
    }, [token]); // Re-run if token changes

    return (
        <AuthContext.Provider value={{ user, token, favorites, recentGames, login, logout, toggleFavorite, recordGamePlayed }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);