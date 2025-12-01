import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import SearchForm from '../components/SearchForm';
import FavoriteButton from '../components/FavoriteButton';
import PaginationControls from '../components/PaginationControls';
import { isCached } from '../services/cacheManager'; // <-- added

// Module-level memo of cache checks to avoid re-checking same URL repeatedly
const romCacheStatus = new Map(); // url -> boolean

export default function Home() {
    const { token, favorites, recentGames, cachedGames, recordGamePlayed,  } = useAuth();
    const navigate = useNavigate();
    const [cacheStatusUpdate, setCacheStatusUpdate] = useState(0); // Trigger updates when cache status changes

    const handleSearch = ({ searchTerm, platform, region }) => {
        navigate(`/search?search=${encodeURIComponent(searchTerm)}&platform=${platform}&region=${region}`);
        window.location.reload()
    };

    const handleRomClick = (rom) => {
        recordGamePlayed(rom);
        navigate('/game', { state: { rom, platform: 'all' } });
        window.location.reload();
    };

    const GameCard = React.memo(({ game }) => {
        const [imageError, setImageError] = useState(false);
        const [aspectRatio, setAspectRatio] = useState(3 / 4);
        const [transform, setTransform] = useState({});
        const [cachedState, setCachedState] = useState(null); // null = unknown, true/false = known
        const cardRef = useRef(null);
        const { favorites, addCachedGame, removeCachedGame } = useAuth();

        // Do a safe cache check for this ROM's first link (non-blocking, memoized)
        useEffect(() => {
            let canceled = false;
            const url = game?.links?.[0]?.url;
            if (!url) {
                setCachedState(false);
                return;
            }
            // If we already know it, use cached result immediately
            if (romCacheStatus.has(url)) {
                const isCached = !!romCacheStatus.get(url);
                setCachedState(isCached);
                if (isCached) {
                    addCachedGame(game);
                } else {
                    removeCachedGame(game);
                }
                return;
            }

            // Async check (fire-and-forget style but cancel-safe)
            (async () => {
                try {
                    const cached = await isCached(url); // [`isCached`](src/services/cacheManager.js)
                    if (canceled) return;
                    romCacheStatus.set(url, !!cached);
                    setCachedState(!!cached);
                    // Add or remove from cachedGames array
                    if (cached) {
                        addCachedGame(game);
                    } else {
                        removeCachedGame(game);
                    }
                    // Trigger a re-evaluation of cached games row
                    setCacheStatusUpdate(prev => prev + 1);
                } catch (err) {
                    if (canceled) return;
                    romCacheStatus.set(url, false);
                    setCachedState(false);
                    removeCachedGame(game);
                }
            })();

            return () => { canceled = true; };
        }, [game, addCachedGame, removeCachedGame]);

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

        const isFavorited = useMemo(() => {
            const gameUrl = game?.links?.[0]?.url;
            if (!gameUrl) return false;
            return favorites.some(f => f?.links?.[0]?.url === gameUrl);
        }, [favorites, game?.links?.[0]?.url]);

        const imageUrl = game.boxart_url
            ? (() => { const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'; return `${apiUrl}/api/proxy-image?url=${encodeURIComponent(game.boxart_url)}`; })()
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
                    {/* cached indicator: small non-interactive emoji with bg: green when cached, gray otherwise */}
                    <div className="absolute top-1 right-8 z-10 pointer-events-none">
                        <span
                            title={cachedState === true ? "Cached locally" : "Not cached"}
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-sm ${cachedState === true ? 'bg-emerald-500' : 'bg-gray-500'}`}
                            aria-hidden="true"
                        >
                            <span className="leading-none">💾</span>
                        </span>
                    </div>
                    <FavoriteButton item={game} isFavoritedProp={isFavorited} variant="card" />
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
        const [page, setPage] = useState(1);
        const [pageInput, setPageInput] = useState('1');
        const pageInputRef = useRef(null);
        const itemsPerPage = 8;
        const totalPages = Math.ceil(games.length / itemsPerPage);
        const startIdx = (page - 1) * itemsPerPage;
        const endIdx = startIdx + itemsPerPage;
        const visibleGames = games.slice(startIdx, endIdx);

        useEffect(() => {
            if (pageInputRef.current !== document.activeElement) {
                setPageInput(page.toString());
            }
        }, [page]);

        return (
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                    {totalPages > 1 && (
                        <div className="flex gap-2 items-center">
                            <PaginationControls 
                                page={page} 
                                setPage={setPage} 
                                totalResults={games.length} 
                                pageSize={itemsPerPage} 
                                pageInput={pageInput} 
                                setPageInput={setPageInput} 
                                pageInputRef={pageInputRef} 
                            />
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {visibleGames.map((game) => {
                        const gameUrl = game?.links?.[0]?.url;
                        return (
                            <div key={gameUrl || Math.random()}>
                                <GameCard game={game} />
                            </div>
                        );
                    })}
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

    const cachedGamesSection = useMemo(() => {
        return token && (
            <div className="max-w-7xl mx-auto mb-12">
                {cachedGames.length > 0 ? (
                    <MemoizedGameRow title="💾 Downloaded Games" games={cachedGames} />
                ) : (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">💾 Downloaded Games</h2>
                        <div className="h-48 rounded-lg flex items-center justify-center">
                            <p className="text-gray-400">Download games to see them here!</p>
                        </div>
                    </div>
                )}
            </div>
        );
    }, [token, cachedGames]);

    return (
        <>
            <div className="mt-16 p-4 bg-gray-100 dark:bg-gray-900" style={{ overflow: 'visible' }}>
                <SearchForm onSearch={handleSearch} />
            </div>


            <div className="bg-linear-to-b from-gray-100 dark:from-gray-900 to-gray-50 dark:to-black min-h-screen p-4">
                {favoritesSection}
                {recentGamesSection}
                {cachedGamesSection}
            </div>
        </>
    );
}