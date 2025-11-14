import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

export default function Game() {
    const location = useLocation();
    const navigate = useNavigate();
    const { recordGamePlayed } = useAuth();
    
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
        <div className="min-h-screen mt-16 p-4 bg-gray-100 dark:bg-gray-900">
            <div className="mt-8 w-full flex justify-center">
                <div className="w-full max-w-4xl h-[720px] border-2 border-gray-700 rounded-lg bg-black overflow-hidden">
                    <iframe
                        src={`/emulator.html?core=${selectedCore}&gameUrl=${encodeURIComponent(selectedRomUrl)}`}
                        className="border-0 h-full w-full"
                        title="Emulator"
                        allow="cross-origin-isolated"
                    />
                </div>
            </div>

            <button
                onClick={() => navigate('/page')}
                className="mt-4 px-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
            >
                Back to Game List
            </button>
        </div>
    );
}
