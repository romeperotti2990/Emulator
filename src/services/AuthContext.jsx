import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('favorites');
        return saved ? JSON.parse(saved) : [];
    });
    const [recentGames, setRecentGames] = useState([]);
    const [cachedGames, setCachedGames] = useState([]);

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
        setRecentGames([]); // Reset recent games on login
        // Navigation will be handled by the component calling login
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setFavorites([]);
        setRecentGames([]); // Reset recent games on logout
        setCachedGames([]); // Reset cached games on logout
        // Navigation will be handled by the component calling logout
    };

    const toggleFavorite = useCallback((game) => {
        setFavorites(prev => {
            const gameUrl = game?.links?.[0]?.url;
            if (!gameUrl) return prev;
            const exists = prev.some(f => f?.links?.[0]?.url === gameUrl);
            const next = exists
                ? prev.filter(f => f?.links?.[0]?.url !== gameUrl) // remove (new array)
                : [game, ...prev]; // add (new array)
            try { localStorage.setItem('favorites', JSON.stringify(next)); } catch (e) { /* ignore */ }
            return next;
        });
    }, [setFavorites]);

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

    const addCachedGame = useCallback((game) => {
        setCachedGames(prev => {
            const gameUrl = game?.links?.[0]?.url;
            if (!gameUrl) return prev;
            const exists = prev.some(g => g?.links?.[0]?.url === gameUrl);
            return exists ? prev : [...prev, game];
        });
    }, []);

    const removeCachedGame = useCallback((game) => {
        setCachedGames(prev => {
            const gameUrl = game?.links?.[0]?.url;
            if (!gameUrl) return prev;
            return prev.filter(g => g?.links?.[0]?.url !== gameUrl);
        });
    }, []);

    // Auto-fetch user's favorites on load if we have a token
    useEffect(() => {
        if (token) {
            const fetchFavorites = async () => {
                const res = await fetch('http://localhost:3001/api/favorites', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const body = await res.json();
                    const favs = Array.isArray(body) ? body : (Array.isArray(body?.favorites) ? body.favorites : []);
                    setFavorites(favs.slice());
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
        <AuthContext.Provider value={{
            user, token, favorites, recentGames, cachedGames, login, logout, toggleFavorite, recordGamePlayed, addCachedGame, removeCachedGame
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);