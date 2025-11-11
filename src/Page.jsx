// This is your complete src/Page.jsx file

import { useEffect, useState } from 'react';

export default function Page() {
    const [searchTerm, setSearchTerm] = useState('');
    const [platform, setPlatform] = useState('*');
    const [region, setRegion] = useState('us');
    const [selectedRomUrl, setSelectedRomUrl] = useState(null);
    const [selectedCore, setSelectedCore] = useState(null); // We need this now
    const [error, setError] = useState('');
    const [roms, setRoms] = useState([]);
    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const pageSize = 10;

    async function fetchROMs() {
        if (!searchTerm.trim()) return;
        try {
            const requestBody = {
                search_key: searchTerm, 
                platforms: [platform], 
                max_results: pageSize, 
                page: page, 
                ...(region && { regions: [region] }),
            };
            console.log(platform)
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

            // Set both the ROM URL and the Core name without mutating React state directly
            let core = platform;
            if (typeof core === 'string' && core.startsWith('gb')) {
                core = 'gb';
            }
            setSelectedCore(core);
            console.log(core);
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
        <div className="min-h-screen mt-20 bg-gray-100">
            <div className="flex gap-4 mb-4">
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
                    className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-white"
                >
                    <option value={["gb", "gbc"]}>All</option>
                    <option value="gb">Game Boy </option>
                    <option value="gbc"> Game Boy Color </option>
                    <option value="gba">Game Boy Advance</option>
                    <option value="nes">NES</option>
                    <option value="snes">SNES</option>
                    <option value="n64">Nintendo 64</option>
                </select>
                <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-white"
                >
                    <option value="">Worldwide</option>
                    <option value="us">USA</option>
                    <option value="eu">Europe</option>
                    <option value="jp">Japan</option>
                </select>
            </div>

            {!selectedRomUrl && (
                <>
                    {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
                    {totalResults > 0 && <p className="text-sm text-gray-600 mb-2">Found {totalResults} results</p>}
                    <ul className="list-none p-0">
                        {roms.map((rom, index) => (
                            <li key={index} className="mb-4">
                                <button
                                    onClick={() => handleRomClick(rom)}
                                    className="w-full flex items-center gap-4 p-3 rounded-md border hover:shadow-sm transition hover:bg-gray-600 hover:cursor-pointer"
                                >
                                    {rom.boxart_url && (
                                        <img
                                            src={
                                                rom.boxart_url.startsWith('http')
                                                    ? `http://localhost:3001/api/proxy-image?url=${encodeURIComponent(rom.boxart_url)}`
                                                    : rom.boxart_url
                                            }
                                            alt={rom.title}
                                            className="w-20 h-auto rounded-sm object-contain "
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        />
                                    )}
                                    <span className="text-left font-medium">{rom.title || rom.name || `ROM ${index + 1}`}</span>
                                </button>
                            </li>
                        ))}
                    </ul>

                    {roms.length > 0 && (
                        <div className="mt-4 flex items-center">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="mx-4 text-sm text-gray-700">
                                Page {page} of {Math.ceil(totalResults / pageSize)}
                            </span>
                            <button
                                onClick={() => {
                                    const maxPage = Math.ceil(totalResults / pageSize);
                                    setPage((p) => Math.min(maxPage, p + 1));
                                }}
                                disabled={page >= Math.ceil(totalResults / pageSize)}
                                className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {selectedRomUrl && (
                <>
                    <div className="mt-8 w-full flex justify-center">
                        <div className="w-full max-w-4xl h-[720px] border-2 border-gray-700 rounded-lg bg-black overflow-hidden">
                            <iframe
                                src={`/emulator.html?core=${selectedCore}&gameUrl=${encodeURIComponent(selectedRomUrl)}`}
                                className="border-0 h-full w-full"
                                title="Emulator"
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => setSelectedRomUrl(null)}
                        className="mt-4 px-4 py-2 bg-white border rounded-md hover:bg-gray-100 hover:cursor-pointer"
                    >
                         Back to Game List
                    </button>
                </>
            )}
        </div>
    );
}