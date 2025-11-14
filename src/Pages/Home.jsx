import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

export default function Home() {
    const { token, favorites, recentGames, recordGamePlayed } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [platform, setPlatform] = useState('all');
    const [region, setRegion] = useState('us');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Popular game searches to create "categories"
    const popularSearches = ['Mario', 'Zelda', 'Pokemon', 'Sonic', 'Megaman', 'Donkey Kong'];

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/page?search=${encodeURIComponent(searchTerm)}&platform=${platform}&region=${region}`);
        }
    };

    const handleRomClick = (rom) => {
        recordGamePlayed(rom);
    };

    // Fetch popular games for each category
    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const results = await Promise.all(
                    popularSearches.map(async (search) => {
                        const response = await fetch('http://localhost:3001/api/crocdb', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                search_key: search,
                                max_results: 12,
                                page: 1,
                            }),
                        });
                        const data = await response.json();
                        const games = Array.isArray(data?.data?.results) ? data.data.results : [];
                        return {
                            title: search,
                            games: games.slice(0, 8), // Show 8 per row
                        };
                    })
                );
                setCategories(results.filter(cat => cat.games.length > 0));
            } catch (err) {
                console.error('Error fetching categories:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const GameCard = ({ game }) => {
        const [imageError, setImageError] = useState(false);
        const [aspectRatio, setAspectRatio] = useState(3 / 4);

        const imageUrl = game.boxart_url
            ? `http://localhost:3001/api/proxy-image?url=${encodeURIComponent(game.boxart_url)}`
            : null;

        const handleImageLoad = (e) => {
            const img = e.target;
            if (img.naturalWidth && img.naturalHeight) {
                setAspectRatio(img.naturalWidth / img.naturalHeight);
            }
        };

        return (
            <div
                onClick={() => handleRomClick(game)}
                className="group/item relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 group-hover/card:scale-125 group-hover/card:hover:scale-125"
                style={{ aspectRatio: aspectRatio }}
            >
                {imageUrl && !imageError ? (
                    <img
                        src={imageUrl}
                        alt={game.title || game.name}
                        onLoad={handleImageLoad}
                        onError={() => {
                            setImageError(true);
                        }}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center aspect-3/4">
                        <span className="text-gray-500 text-center text-xs px-2">{game.title || game.name}</span>
                    </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black to-transparent p-3 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
                    <p className="text-white font-semibold text-sm line-clamp-2">
                        {game.title || game.name}
                    </p>
                    <p className="text-xs text-gray-300 mt-1">Click to play</p>
                </div>
            </div>
        );
    };

    const GameRow = ({ title, games }) => (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
            <div className="relative group">
                <div className="overflow-x-auto scrollbar-hide">
                    <div className="flex gap-4 pb-4">
                        {games.map((game, idx) => (
                            <div key={idx} className="shrink-0 w-24 sm:w-28 md:w-32 lg:w-36 group/card hover:z-50">
                                <GameCard game={game} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className="mt-16 p-4 bg-gray-100 dark:bg-gray-900">
                <form onSubmit={handleSearch} className="flex gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Find a game..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch(e);
                            }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:placeholder-gray-400"
                    />
                    <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                    >
                        <option value="all">All Platforms</option>
                        <option value="gb">Game Boy </option>
                        <option value="gbc">Game Boy Color</option>
                        <option value="gba">Game Boy Advance</option>
                        <option value="nes">NES</option>
                        <option value="snes">SNES</option>
                        <option value="n64">Nintendo 64</option>
                    </select>
                    <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                    >
                        <option value="">Worldwide</option>
                        <option value="us">USA</option>
                        <option value="eu">Europe</option>
                        <option value="jp">Japan</option>
                    </select>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-md font-medium transition"
                    >
                        Search
                    </button>
                </form>
            </div>

            <div className="bg-linear-to-b from-gray-100 dark:from-gray-900 to-gray-50 dark:to-black min-h-screen p-4">
                {/* Favorites Row */}
                {token && (
                    <div className="max-w-7xl mx-auto mb-8">
                        {favorites && favorites.length > 0 ? (
                            <GameRow title="⭐ Your Favorites" games={favorites.slice(0, 8)} />
                        ) : (
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-4">⭐ Your Favorites</h2>
                                <div className="h-48 rounded-lg flex items-center justify-center">
                                    <p className="text-gray-400">No favorites yet — star games to add them here!</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Recent Games Row */}
                {token && (
                    <div className="max-w-7xl mx-auto">
                        {recentGames && recentGames.length > 0 ? (
                            <GameRow title="🕐 Recently Played" games={recentGames.slice(0, 8)} />
                        ) : (
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-4">🕐 Recently Played</h2>
                                <div className="h-48 rounded-lg flex items-center justify-center">
                                    <p className="text-gray-400">Start playing games to see them here!</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Browse Categories */}
                {loading ? (
                    <div className="flex items-center justify-center py-20 max-w-7xl mx-auto">
                        <div className="text-gray-600 dark:text-gray-400">Loading popular games...</div>
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto">
                        {categories.map((category, idx) => (
                            <GameRow
                                key={idx}
                                title={`Popular ${category.title}`}
                                games={category.games}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* CSS for scrollbar hiding */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </>
    );
}
