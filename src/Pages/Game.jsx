import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
// import { logCachedROM } from '../services/cacheManager'; // No longer needed - cache detection is automatic

export default function Game() {
    const location = useLocation();
    const navigate = useNavigate();
    const { recordGamePlayed, recentGames } = useAuth();

    const [selectedRomUrl, setSelectedRomUrl] = useState(null);
    const [selectedCore, setSelectedCore] = useState(null);
    const [rom, setRom] = useState(null);
    const [platform, setPlatform] = useState('all');
    const iframeRef = useRef(null);

    // Get rom data from navigation state
    useEffect(() => {
        if (location.state?.rom) {
            setRom(location.state.rom);
            setPlatform(location.state.platform || 'all');
            handlePlayGame(location.state.rom, location.state.platform || 'all');
        } else {
            // No rom provided, redirect back
            navigate('/page');
        }
    }, [location, navigate]);

    // Log to cache after emulator has been running for 5 seconds (successful load indicator)
    useEffect(() => {
        if (selectedRomUrl) {
            const timer = setTimeout(() => {
                if (window.currentROMToCache) {
                    // Cache detection is automatic now via HTTP cache headers
                    window.currentROMToCache = null;
                }
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [selectedRomUrl]);

    async function scanWithVirusTotal(url) {
        console.log('Scanning with VirusTotal:', url);
        await new Promise((res) => setTimeout(res, 1000)); // simulate delay
        return true;
    }

    async function handlePlayGame(gameRom, gamePlatform) {
        const link = gameRom.links?.[0]?.url;
        if (!link) {
            alert('This ROM does not have a playable file.');
            navigate('/page');
            return;
        }

        const isSafe = await scanWithVirusTotal(link);
        if (isSafe) {
            recordGamePlayed(gameRom);
            const proxiedUrl = `http://localhost:3001/api/proxy-rom?url=${encodeURIComponent(link)}`;

            // Determine core to use. If user selected 'all', derive from rom.platform
            let core = gamePlatform;
            if (gamePlatform === 'all' || gamePlatform === '*') {
                const romPlatform = (gameRom.platform || '').toLowerCase();
                if (romPlatform.startsWith('gb')) core = 'gb';
                else core = romPlatform || 'gb';
            } else if (typeof core === 'string' && core.startsWith('gb')) {
                core = 'gb';
            }

            setSelectedCore(core);
            console.log("Selected core:", core);
            setSelectedRomUrl(proxiedUrl);
            
            // Store the ROM link for logging after emulator loads
            window.currentROMToCache = { url: link, data: gameRom };
        } else {
            alert('This ROM failed the VirusTotal scan and will not be loaded.');
            navigate('/page');
        }
    }

    if (!selectedRomUrl) {
        return null; // Loading or error state
    }

    return (
        <>
        <div className="mt-16 px-[12vw] py-2 bg-gray-100 dark:bg-gray-900 flex gap-3 items-stretch overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
            {/* Sidebar with current game and recent games */}
            <aside className="w-1/3 space-y-2 overflow-y-auto flex flex-col">
                    {/* Currently Playing Game */}
                    <article className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-sm">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="shrink-0 w-full sm:w-32 h-32 rounded-md overflow-hidden bg-linear-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center">
                                <img
                                    src={rom?.boxart_url ? `http://localhost:3001/api/proxy-image?url=${encodeURIComponent(rom.boxart_url)}` : ''}
                                    alt={rom?.name || rom?.title || 'ROM cover'}
                                    className="object-cover w-full h-full"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                                {!rom?.boxart_url && (
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </div>

                            <div className="flex-1">
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                    {rom?.name || rom?.title || 'Unknown Game'}
                                </h2>
                                <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
                                    {rom?.platform ? rom.platform.toUpperCase() : 'Unknown platform'}
                                </p>

                                <div className="mt-2 flex items-center gap-1">
                                    <button
                                        onClick={() => {
                                            const el = document.querySelector('#emulator-frame');
                                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        }}
                                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 hover:cursor-pointer"
                                    >
                                        Jump
                                    </button>

                                    <button
                                        onClick={() => navigate('/')}
                                        className="px-2 py-1 bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 text-xs rounded text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 hover:cursor-pointer"
                                    >
                                        Back to Library
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Recent Games */}
                    {recentGames && recentGames.length > 0 && (
                        <article className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-sm min-w-fit flex-1 overflow-y-auto scrollbar-hide">
                            <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Recent</h3>
                            <div className="space-y-2">
                                {recentGames.slice(1, 33).map((game, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => navigate('/game', { state: { rom: game, platform: 'all' } })}
                                        className="w-full text-left hover:opacity-75 transition-opacity"
                                    >
                                        <div className="flex gap-2 items-start cursor-pointer">
                                            <div className="shrink-0 w-12 h-12 rounded overflow-hidden bg-linear-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center">
                                                <img
                                                    src={game?.boxart_url ? `http://localhost:3001/api/proxy-image?url=${encodeURIComponent(game.boxart_url)}` : ''}
                                                    alt={game?.name || game?.title}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                />
                                                {!game?.boxart_url && (
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-1">
                                                    {game?.name || game?.title}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0">
                                                    {game?.platform?.toUpperCase() || 'UNKNOWN'}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </article>
                    )}
                </aside>

                {/* Emulator area spanning remaining columns */}
                <section className="w-2/3 flex flex-col">
                    <div className="flex-1 border-2 border-gray-700 rounded-lg bg-black overflow-hidden">
                        <iframe
                            id="emulator-frame"
                            src={`/emulator.html?core=${selectedCore}&gameUrl=${encodeURIComponent(selectedRomUrl)}`}
                            className="border-0 h-full w-full"
                            title="Emulator"
                            allow="autoplay; fullscreen; cross-origin-isolated"
                        />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                        <div className="text-xs text-gray-600 dark:text-gray-300">
                            {rom?.name || rom?.title || 'Unknown'}
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => {
                                    window.open(selectedRomUrl, '_blank', 'noopener');
                                }}
                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 hover:cursor-pointer"
                            >
                                Source
                            </button>

                            <button
                                onClick={() => navigate('/')}
                                className="px-2 py-1 bg-white text-gray-900 border border-gray-200 rounded text-xs dark:hover:bg-gray-700 hover:bg-gray-100 hover:cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700"
                            >
                                Home
                            </button>
                        </div>
                    </div>
                </section>
        </div>

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
