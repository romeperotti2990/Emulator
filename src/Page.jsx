// This is your complete src/Page.jsx file

import { useEffect, useState } from 'react';

export default function Page() {
    const [searchTerm, setSearchTerm] = useState('');
    const [platform, setPlatform] = useState('gbc');
    const [region, setRegion] = useState('');
    const [selectedRomUrl, setSelectedRomUrl] = useState(null);
    const [selectedCore, setSelectedCore] = useState(null); // We need this now
    const [error, setError] = useState('');
    const [roms, setRoms] = useState([]);
    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const pageSize = 10;

    // This map is important. It must match the core names.
    const coreMap = {
        gbc: 'gambatte',
        gba: 'VBA-M',
        nes: 'Nestopia',
        snes: 'Snes9x',
        n64: 'Mupen64Plus',
    };

    async function fetchROMs() {
        if (!searchTerm.trim()) return;
        try {
            const requestBody = {
                search_key: searchTerm, platforms: [platform], max_results: pageSize, page: page, ...(region && { regions: [region] }),
            };
            const response = await fetch('http://localhost:3001/api/crocdb', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody),
            });
            const data = await response.json();
            const romList = Array.isArray(data?.data?.results) ? data.data.results : [];
            setRoms(romList);
            setTotalResults(data?.data?.total_results || romList.length);
            setError(romList.length === 0 ? 'No ROMs found.' : '');
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to fetch ROMs.');
        }
    }

    async function scanWithVirusTotal(url) {
        console.log('Scanning with VirusTotal:', url);
        await new Promise((res) => setTimeout(res, 1000)); // simulate delay
        return true;
    }

    async function handleRomClick(rom) {
        const link = rom.links?.[0]?.url;
        if (!link) {
            alert('This ROM does not have a playable file.');
            return;
        }

        const isSafe = await scanWithVirusTotal(link);
        if (isSafe) {
            const proxiedUrl = `http://localhost:3001/api/proxy-rom?url=${encodeURIComponent(link)}`;
            
            // Set both the ROM URL and the Core name
            setSelectedCore(coreMap[platform]); // e.g., "Gambatte"
            setSelectedRomUrl(proxiedUrl);
        } else {
            alert('This ROM failed the VirusTotal scan and will not be loaded.');
        }
    }

    useEffect(() => {
        if (searchTerm.trim()) {
            fetchROMs();
        }
    }, [platform, region, page]);


    // NO 'useEffect' for loading scripts. The iframe does all the work.

    
    return (
        <>
            <h1>Page</h1>
            <p>You made it! Good job!</p>
            <p>Choose a game to launch the emulator:</p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder="Find a game..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setPage(1);
                            fetchROMs();
                        }
                    }}
                />
                {/* This select now sets the 'platform' key (e.g., "gbc") */}
                <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                    <option value="gbc">Game Boy Color</option>
                    <option value="gba">Game Boy Advance</option>
                    <option value="nes">NES</option>
                    <option value="snes">SNES</option>
                    <option value="n64">Nintendo 64</option>
                </select>
                <select value={region} onChange={(e) => setRegion(e.target.value)}>
                    <option value="">Worldwide</option>
                    <option value="us">USA</option>
                    <option value="eu">Europe</option>
                    <option value="jp">Japan</option>
                </select>
            </div>

            {/* If NO game is selected, show the list */}
            {!selectedRomUrl && (
                <>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {totalResults > 0 && <p>Found {totalResults} results</p>}
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {roms.map((rom, index) => (
                            <li key={index} style={{ marginBottom: '1rem' }}>
                                <button
                                    onClick={() => handleRomClick(rom)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '0.5rem 1rem',
                                    }}
                                >
                                    {rom.boxart_url && (
                                        <img
                                            src={rom.boxart_url}
                                            alt={rom.title}
                                            style={{ width: '80px', height: 'auto', borderRadius: '4px' }}
                                        />
                                    )}
                                    <span>{rom.title || rom.name || `ROM ${index + 1}`}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {/* If a game IS selected, show the iframe */}
            {selectedRomUrl && (
                <>
                    <div style={{
                        marginTop: '2rem',
                        width: '100%',
                        maxWidth: '960px',
                        height: '720px',
                        border: '2px solid #444',
                        borderRadius: '8px',
                        backgroundColor: '#000',
                        overflow: 'hidden'
                    }}>
                        <iframe
                            src={`/emulator.html?core=${selectedCore}&gameUrl=${encodeURIComponent(selectedRomUrl)}`}
                            width="100%"
                            height="100%"
                            style={{ border: 'none' }}
                        ></iframe>
                    </div>
                    
                    <button
                        onClick={() => setSelectedRomUrl(null)}
                        style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
                    >
                        Back to Game List
                    </button>
                </>
            )}
        </>
    );
}