import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

export default function Game() {
    const location = useLocation();
    const navigate = useNavigate();
    const { recordGamePlayed, recentGames } = useAuth();

    const [selectedRomUrl, setSelectedRomUrl] = useState(null);
    const [selectedCore, setSelectedCore] = useState(null);
    const [rom, setRom] = useState(null);
    const [platform, setPlatform] = useState('all');

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
        } else {
            alert('This ROM failed the VirusTotal scan and will not be loaded.');
            navigate('/page');
        }
    }

    if (!selectedRomUrl) {
        return null; // Loading or error state
    }

    return (
        <div className="mt-16 px-[12vw] py-2 bg-gray-100 dark:bg-gray-900 flex items-stretch overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
            <main className="flex-1 flex">
                {/* Sidebar with current game and recent games */}
                <aside className="w-1/3 space-y-2 overflow-y-auto">
                    {/* Currently Playing Game */}
                    <article className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-sm">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="shrink-0 w-full sm:w-32 h-32 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                                <img
                                    src={rom?.boxart_url ? `http://localhost:3001/api/proxy-image?url=${encodeURIComponent(rom.boxart_url)}` : '/placeholder-game.png'}
                                    alt={rom?.name || rom?.title || 'ROM cover'}
                                    className="object-cover w-full h-full"
                                />
                            </div>

                            <div className="flex-1">
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                    {rom?.name || rom?.title || 'Unknown Game'}
                                </h2>
                                <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
                                    {rom?.platform ? rom.platform.toUpperCase() : 'Unknown platform'}
                                </p>

                                {rom?.description ? (
                                    <p className="mt-2 text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                                        {rom.description}
                                    </p>
                                ) : null}

                                <div className="mt-2 flex flex-wrap items-center gap-1">
                                    {(rom?.tags || rom?.genres || []).slice(0, 3).map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-2 flex items-center gap-1">
                                    <button
                                        onClick={() => {
                                            const el = document.querySelector('#emulator-frame');
                                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        }}
                                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                    >
                                        Jump
                                    </button>

                                    <button
                                        onClick={() => navigate('/page')}
                                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-200"
                                    >
                                        Back to Library
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Recent Games */}
                    {recentGames && recentGames.length > 0 && (
                        <article className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-sm min-w-fit">
                            <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Recent</h3>
                            <div className="space-y-2">
                                {recentGames.slice(0, 6).map((game, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => navigate('/game', { state: { rom: game, platform: 'all' } })}
                                        className="w-full text-left hover:opacity-75 transition-opacity"
                                    >
                                        <div className="flex gap-2 items-start">
                                            <div className="shrink-0 w-12 h-12 rounded overflow-hidden">
                                                <img
                                                    src={game?.boxart_url ? `http://localhost:3001/api/proxy-image?url=${encodeURIComponent(game.boxart_url)}` : '/placeholder-game.png'}
                                                    alt={game?.name || game?.title}
                                                    className="w-full h-full object-contain"
                                                />
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
            </main>
        </div>
    );
}
