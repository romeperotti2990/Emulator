import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import React from 'react';

export default function Home() {
    const { token, favorites, recentGames, recordGamePlayed } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [platform, setPlatform] = useState('all');
    const [region, setRegion] = useState('us');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?search=${encodeURIComponent(searchTerm)}&platform=${platform}&region=${region}`);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleRomClick = (rom) => {
        recordGamePlayed(rom);
        navigate('/game', { state: { rom, platform: 'all' } });
    };

    const FavoriteButton = React.memo(({ game, isFavorited }) => {
        const { toggleFavorite } = useAuth();

        const handleToggleFavorite = (e) => {
            e.stopPropagation();
            toggleFavorite(game);
        };

        return (
            <button
                onClick={handleToggleFavorite}
                title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                className={`absolute top-1 right-1 w-6 h-6 rounded-full z-10 transition-colors flex items-center justify-center leading-none ${isFavorited ? 'bg-yellow-400 text-gray-900' : 'bg-gray-900/70 text-yellow-400 hover:bg-gray-900'}`}
                style={{ fontSize: '0.75rem', lineHeight: '1' }}
            >
                <span aria-hidden="true" style={{ marginTop: '-0.05rem' }}>{isFavorited ? '★' : '☆'}</span>
            </button>
        );
    }, (prevProps, nextProps) => {
        return prevProps.isFavorited === nextProps.isFavorited && prevProps.game.links[0].url === nextProps.game.links[0].url;
    });

    const GameCard = React.memo(({ game }) => {
        const [imageError, setImageError] = useState(false);
        const [aspectRatio, setAspectRatio] = useState(3 / 4);
        const [transform, setTransform] = useState({});
        const cardRef = useRef(null);
        const { favorites } = useAuth();

        const MAX_ROTATION = 11;
        const HOVER_SCALE = 1.6;

        const handleMouseMove = (e) => {
            if (!cardRef.current) return;
            const rect = cardRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const width = rect.width;
            const height = rect.height;

            const rotateY = (x / width - 0.5) * 2 * MAX_ROTATION;
            const rotateX = (0.5 - y / height) * 2 * MAX_ROTATION;

            setTransform({
                transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${HOVER_SCALE})`,
                transition: 'transform 0.05s linear',
                position: 'relative',
                zIndex: 9999
            });
        };

        const handleMouseLeave = () => {
            setTransform({
                transform: 'rotateX(0deg) rotateY(0deg) scale(1)',
                transition: 'transform 0.3s ease-out',
                position: 'relative',
                zIndex: 0
            });
        };

        const isFavorited = useMemo(() =>
            favorites.some(f => f.links[0].url === game.links[0].url),
            [favorites, game.links[0].url]
        );

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
                style={{
                    perspective: '1000px',
                    position: 'relative',
                    zIndex: transform.zIndex || 0
                }}
            >
                <div
                    ref={cardRef}
                    onClick={() => handleRomClick(game)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="relative cursor-pointer"
                    style={{
                        aspectRatio: aspectRatio,
                        borderRadius: '0.5rem',
                        boxShadow: '0 10px 15px rgba(0,0,0,0.3)',
                        transform: transform.transform,
                        transition: transform.transition
                    }}
                >
                    <div
                        className="absolute inset-0 bg-gray-800"
                        style={{
                            borderRadius: 'inherit',
                            overflow: 'hidden'
                        }}
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
                    </div>
                    <FavoriteButton game={game} isFavorited={isFavorited} />
                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black to-transparent p-2 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-b-md">
                        <p className="text-white font-semibold text-xs line-clamp-3">
                            {game.title || game.name}
                        </p>
                        <p className="text-xs text-gray-300 mt-1">Click to play</p>
                    </div>
                </div>
            </div>
        );
    });

    const GameRow = ({ title, games }) => {
        const pageRef = useRef(0);
        const [, setRenderTrigger] = useState(0);
        const itemsPerPage = 8;
        const totalPages = Math.ceil(games.length / itemsPerPage);
        const startIdx = pageRef.current * itemsPerPage;
        const endIdx = startIdx + itemsPerPage;
        const visibleGames = games.slice(startIdx, endIdx);

        const goToPrevious = () => {
            pageRef.current = Math.max(0, pageRef.current - 1);
            setRenderTrigger(prev => prev + 1);
        };

        const goToNext = () => {
            pageRef.current = Math.min(totalPages - 1, pageRef.current + 1);
            setRenderTrigger(prev => prev + 1);
        };

        return (
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                    {totalPages > 1 && (
                        <div className="flex gap-2 items-center">
                            <button
                                onClick={goToPrevious}
                                disabled={pageRef.current === 0}
                                className="cursor-pointer px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                            >
                                ← Prev
                            </button>
                            <span className="text-gray-400 text-sm">
                                {pageRef.current + 1} / {totalPages}
                            </span>
                            <button
                                onClick={goToNext}
                                disabled={pageRef.current === totalPages - 1}
                                className="cursor-pointer px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {visibleGames.map((game, idx) => (
                        <div key={idx}>
                            <GameCard game={game} />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const MemoizedGameRow = React.memo(GameRow);

    const favoritesSection = useMemo(() => (
        token && (
            <div className="max-w-7xl mx-auto mb-8">
                {favorites && favorites.length > 0 ? (
                    <MemoizedGameRow title="⭐ Your Favorites" games={favorites} />
                ) : (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">⭐ Your Favorites</h2>
                        <div className="h-48 rounded-lg flex items-center justify-center">
                            <p className="text-gray-400">No favorites yet — star games to add them here!</p>
                        </div>
                    </div>
                )}
            </div>
        )
    ), [token, favorites]);

    const recentGamesSection = useMemo(() => (
        token && (
            <div className="max-w-7xl mx-auto">
                {recentGames && recentGames.length > 0 ? (
                    <MemoizedGameRow title="🕐 Recently Played" games={recentGames} />
                ) : (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">🕐 Recently Played</h2>
                        <div className="h-48 rounded-lg flex items-center justify-center">
                            <p className="text-gray-400">Start playing games to see them here!</p>
                        </div>
                    </div>
                )}
            </div>
        )
    ), [token, recentGames]);

    return (
        <>
            <div className="mt-16 p-4 bg-gray-100 dark:bg-gray-900" style={{ overflow: 'visible' }}>
                <form onSubmit={handleSearch} className="flex gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Find a game..."
                        value={searchTerm}
                        onChange={handleSearchChange}
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

            {/* Favorites Row */}
            <div className="bg-linear-to-b from-gray-100 dark:from-gray-900 to-gray-50 dark:to-black min-h-screen p-4">
            {favoritesSection}                {/* Recent Games Row */}
                {recentGamesSection}
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
