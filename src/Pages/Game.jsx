import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import FavoriteButton from '../components/FavoriteButton';
import { isCached } from '../services/cacheManager';

export default function Game() {
    const location = useLocation();
    const navigate = useNavigate();
    const { recordGamePlayed, recentGames, favorites } = useAuth();

    const [selectedRomUrl, setSelectedRomUrl] = useState(null);
    const [originalRomUrl, setOriginalRomUrl] = useState(null);
    const [selectedCore, setSelectedCore] = useState(null);
    const [rom, setRom] = useState(null);
    const [platform, setPlatform] = useState('all');
    const [cachedState, setCachedState] = useState(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const [recentGamesCachedStatus, setRecentGamesCachedStatus] = useState({});
    const iframeRef = useRef(null);

    // Get rom data from navigation state
    useEffect(() => {
        if (location.state?.rom) {
            setRom(location.state.rom);
            setPlatform(location.state.platform || 'all');
            handlePlayGame(location.state.rom, location.state.platform || 'all');
        } else {
            // No rom provided, redirect back
            navigate('/');
        }
    }, [location, navigate]);

    // Check if current game is favorited
    useEffect(() => {
        if (rom && favorites) {
            const gameUrl = rom?.links?.[0]?.url;
            setIsFavorited(favorites.some(f => f?.links?.[0]?.url === gameUrl));
        }
    }, [rom, favorites]);

    // Check if current game is cached
    useEffect(() => {
        if (rom) {
            let canceled = false;
            const url = rom?.links?.[0]?.url;
            if (!url) {
                setCachedState(false);
                return;
            }
            (async () => {
                try {
                    const cached = await isCached(url);
                    if (canceled) return;
                    setCachedState(cached);
                } catch (err) {
                    if (canceled) return;
                    setCachedState(false);
                }
            })();
            return () => { canceled = true; };
        }
    }, [rom]);

    // Check cached status for recent games with timeout
    useEffect(() => {
        if (recentGames && recentGames.length > 0) {
            const checkCachesWithTimeout = async () => {
                const status = {};
                for (const game of recentGames) {
                    const url = game?.links?.[0]?.url;
                    if (url) {
                        try {
                            // Wrap in a timeout promise that rejects after 2 seconds
                            const cachePromise = isCached(url);
                            const timeoutPromise = new Promise((_, reject) => 
                                setTimeout(() => reject(new Error('Timeout')), 2000)
                            );
                            const cached = await Promise.race([cachePromise, timeoutPromise]);
                            status[url] = cached;
                            // Update immediately after each check completes
                            setRecentGamesCachedStatus(prev => ({ ...prev, [url]: cached }));
                        } catch (err) {
                            // If timeout or error, assume not cached
                            status[url] = false;
                            setRecentGamesCachedStatus(prev => ({ ...prev, [url]: false }));
                        }
                    }
                }
            };
            checkCachesWithTimeout();
        }
    }, [recentGames]);

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

    async function handlePlayGame(gameRom, gamePlatform) {
        const link = gameRom.links?.[0]?.url;
        if (!link) {
            alert('This ROM does not have a playable file.');
            navigate('/');
            return;
        }


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
        setOriginalRomUrl(link);
        setSelectedRomUrl(proxiedUrl);

        // Store the ROM link for logging after emulator loads
        window.currentROMToCache = { url: link, data: gameRom };

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
                            <div className="shrink-0 w-full sm:w-32 h-32 rounded-md overflow-hidden bg-linear-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center relative">
                                <img
                                    src={rom?.boxart_url ? `http://localhost:3001/api/proxy-image?url=${encodeURIComponent(rom.boxart_url)}` : ''}
                                    alt={rom?.name || rom?.title || 'ROM cover'}
                                    className="w-full h-full object-contain"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                                {!rom?.boxart_url && (
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                )}
                                <div className="absolute top-1 right-1">
                                    <FavoriteButton item={rom} isFavoritedProp={isFavorited} variant="card" />
                                </div>
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
                                        Save
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
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            navigate('/game', { state: { rom: game, platform: 'all' } });
                                            window.location.reload();
                                        }}
                                        className="w-full text-left hover:opacity-75 hover:bg-gray-600 transition-opacity cursor-pointer"
                                    >
                                        <div className="flex gap-2 items-start cursor-pointer justify-between">
                                            <div className="flex gap-2 items-start flex-1">
                                                <div className="shrink-0 w-12 h-12 rounded overflow-hidden bg-linear-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center">
                                                    {game?.boxart_url ? (
                                                        <img
                                                            src={`http://localhost:3001/api/proxy-image?url=${encodeURIComponent(game.boxart_url)}`}
                                                            alt={game?.name || game?.title}
                                                            className="w-full h-full object-contain"
                                                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.style.removeProperty('display'); }}
                                                        />
                                                    ) : null}
                                                    <svg 
                                                        className="w-4 h-4 text-gray-400" 
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                        style={game?.boxart_url ? { display: 'none' } : {}}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
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
                                            <div className="shrink-0 flex items-center gap-1 min-w-max">
                                                {recentGamesCachedStatus[game?.links?.[0]?.url] !== undefined && (
                                                    <div
                                                        title={recentGamesCachedStatus[game?.links?.[0]?.url] ? "ROM is cached - ready to play!" : "ROM not cached"}
                                                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-sm shrink-0 ${recentGamesCachedStatus[game?.links?.[0]?.url] ? 'bg-emerald-500' : 'bg-gray-400'}`}
                                                    >
                                                        💾
                                                    </div>
                                                )}
                                                <FavoriteButton item={game} isFavoritedProp={favorites.some(f => f?.links?.[0]?.url === game?.links?.[0]?.url)} variant="list" />
                                            </div>
                                        </div>
                                    </div>
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
                            <input
                                type="file"
                                id="rom-file-input"
                                style={{ display: 'none' }}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    
                                    try {
                                        console.log('Starting upload:', file.name, file.size);
                                        
                                        // Start upload session with timeout
                                        const controller = new AbortController();
                                        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
                                        
                                        const startRes = await fetch('https://rome.mycybersecurityclass.com:3001/api/upload-rom/start', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                originalUrl: originalRomUrl,
                                                filename: file.name
                                            }),
                                            signal: controller.signal
                                        });
                                        
                                        clearTimeout(timeoutId);
                                        
                                        if (!startRes.ok) throw new Error(`Start failed: ${startRes.status}`);
                                        const { sessionId } = await startRes.json();
                                        console.log('Session started:', sessionId);
                                        
                                        // Read file as ArrayBuffer
                                        console.log('Reading file...');
                                        const arrayBuffer = await file.arrayBuffer();
                                        console.log('File read complete, size:', arrayBuffer.byteLength);
                                        
                                        // Helper to safely convert chunk to base64 without stack overflow
                                        const chunkToBase64 = (chunk) => {
                                            const uint8 = new Uint8Array(chunk);
                                            let binary = '';
                                            const batchSize = 8192; // Process 8KB at a time
                                            for (let i = 0; i < uint8.length; i += batchSize) {
                                                const batch = uint8.subarray(i, i + batchSize);
                                                binary += String.fromCharCode.apply(null, batch);
                                            }
                                            return btoa(binary);
                                        };
                                        
                                        // Upload in 1MB chunks
                                        const chunkSize = 1024 * 1024;
                                        const totalChunks = Math.ceil(arrayBuffer.byteLength / chunkSize);
                                        console.log('Starting chunk uploads, total chunks:', totalChunks);
                                        
                                        for (let i = 0; i < arrayBuffer.byteLength; i += chunkSize) {
                                            const start = i;
                                            const end = Math.min(i + chunkSize, arrayBuffer.byteLength);
                                            const chunk = arrayBuffer.slice(start, end);
                                            const chunkIndex = Math.floor(i / chunkSize);
                                            
                                            console.log(`Converting chunk ${chunkIndex + 1}/${totalChunks} to base64...`);
                                            const base64 = chunkToBase64(chunk);
                                            
                                            console.log(`Uploading chunk ${chunkIndex + 1}/${totalChunks} (${base64.length} bytes base64)`);
                                            
                                            const chunkRes = await fetch('https://rome.mycybersecurityclass.com:3001/api/upload-rom/chunk', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    sessionId,
                                                    chunkIndex,
                                                    chunkData: base64
                                                })
                                            });
                                            
                                            if (!chunkRes.ok) {
                                                throw new Error(`Chunk ${chunkIndex} failed: ${chunkRes.status}`);
                                            }
                                            console.log(`Chunk ${chunkIndex + 1}/${totalChunks} uploaded successfully`);
                                        }
                                        
                                        // Finish upload
                                        console.log('Finishing upload');
                                        const finishRes = await fetch('https://rome.mycybersecurityclass.com:3001/api/upload-rom/finish', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ sessionId })
                                        });
                                        
                                        if (!finishRes.ok) {
                                            const error = await finishRes.json();
                                            throw new Error(error.error);
                                        }
                                        
                                        const uploadData = await finishRes.json();
                                        const uploadedUrl = uploadData.uploadedUrl;
                                        
                                        console.log('Upload complete:', uploadedUrl);
                                        
                                        // Cache the uploaded ROM in the browser
                                        console.log('Caching uploaded ROM...');
                                        try {
                                            const cacheRes = await fetch(uploadedUrl);
                                            if (cacheRes.ok) {
                                                console.log('ROM cached successfully');
                                            }
                                        } catch (err) {
                                            console.log('Failed to cache ROM:', err);
                                        }
                                        
                                        // Store the mapping
                                        addUploadedRom(originalRomUrl, uploadedUrl);
                                        
                                        // Determine core from file extension
                                        const ext = file.name.split('.').pop().toLowerCase();
                                        let detectedCore = selectedCore; // Default to current core
                                        if (ext === 'gba' || ext === 'bin') detectedCore = 'gba';
                                        else if (ext === 'zip') {
                                            // If zip, try to detect from ROM name
                                            if (file.name.toLowerCase().includes('gba') || file.name.toLowerCase().includes('advance')) {
                                                detectedCore = 'gba';
                                            }
                                        }
                                        
                                        // Directly use the uploaded URL without going through handlePlayGame
                                        // This prevents the effect from re-running and overriding with the original URL
                                        setSelectedRomUrl(uploadedUrl);
                                        setOriginalRomUrl(uploadedUrl);
                                        setSelectedCore(detectedCore);
                                        setCachedState(true);
                                        
                                        alert('ROM uploaded successfully!');
                                    } catch (err) {
                                        console.error('Upload failed:', err);
                                        alert('Failed to upload ROM: ' + err.message);
                                    }
                                    // Reset input
                                    e.target.value = '';
                                }}
                                accept=".zip,.7z,.rar,.bin,.iso,.gba,.gb,.gbc,.rom,.nes,.sfc,.z64"
                            />
                            <button
                                onClick={() => {
                                    if (!originalRomUrl) {
                                        alert('No ROM URL available');
                                        return;
                                    }
                                    document.getElementById('rom-file-input')?.click();
                                }}
                                disabled={cachedState}
                                className={`px-2 py-1 text-xs rounded ${
                                    cachedState
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-purple-600 text-white hover:bg-purple-700 hover:cursor-pointer'
                                }`}
                            >
                                Upload ROM
                            </button>

                            <button
                                onClick={() => {
                                    const filename = `${rom?.name || rom?.title || 'game'}.zip`;
                                    if (cachedState) {
                                        // For cached games, use blob approach for proper filename
                                        (async () => {
                                            try {
                                                const response = await fetch(`https://rome.mycybersecurityclass.com:3001/api/proxy-rom?url=${encodeURIComponent(originalRomUrl)}`);
                                                const blob = await response.blob();
                                                const url = window.URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.download = filename;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                                window.URL.revokeObjectURL(url);
                                            } catch (err) {
                                                console.error('Cached download failed:', err);
                                            }
                                        })();
                                    } else {
                                        // For non-cached games, use direct link
                                        window.location.href = `http://localhost:3001/api/proxy-rom?url=${encodeURIComponent(originalRomUrl)}`;
                                    }
                                }}
                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 hover:cursor-pointer"
                            >
                                Download Source ROM
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
