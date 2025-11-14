import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

function FavoriteButton({ rom }) {
    // Get global state from AuthContext
    const { favorites, toggleFavorite } = useAuth();

    // Check if this rom is in the global favorites list
    const isFavorited = favorites.some(f => f.links[0].url === rom.links[0].url);

    const handleToggle = (e) => {
        e.stopPropagation(); // Stop click from triggering game load
        toggleFavorite(rom); // Call the global toggle function
    };

    return (
        <button
            onClick={handleToggle}
            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
            <svg className={`w-5 h-5 ${isFavorited ? 'text-yellow-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.95-.69l1.07-3.292z" />
            </svg>
        </button>
    );
}


export default function Search() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [platform, setPlatform] = useState('all');
    const [region, setRegion] = useState('us');
    const [error, setError] = useState('');
    const [roms, setRoms] = useState([]);
    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const pageSize = 10;

    // Initialize from URL params on component mount
    useEffect(() => {
        const search = searchParams.get('search') || '';
        const plat = searchParams.get('platform') || 'all';
        const reg = searchParams.get('region') || 'us';

        if (search) {
            setSearchTerm(search);
            setPlatform(plat);
            setRegion(reg);
            // Trigger search after state is set
            setTimeout(() => {
                if (search.trim()) {
                    fetchROMs();
                }
            }, 0);
        }
    }, [searchParams]);

    async function fetchROMs() {
        if (!searchTerm.trim()) return;
        try {
            const requestBody = {
                search_key: searchTerm,
                max_results: pageSize,
                page: page,
                ...(region && { regions: [region] }),
            };

            // Only include a platforms filter when the user picks a specific platform
            if (platform && platform !== 'all') {
                // map 'gb' to both gb and gbc for broader coverage
                if (platform === 'gb') {
                    requestBody.platforms = ['gb', 'gbc'];
                } else {
                    requestBody.platforms = [platform];
                }
            }

            const response = await fetch('http://localhost:3001/api/crocdb', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody),
            });
            const data = await response.json();
            console.log(data);
            const romList = Array.isArray(data?.data?.results) ? data.data.results : [];
            setRoms(romList);
            setTotalResults(data?.data?.total_results || romList.length);
            setError(romList.length === 0 ? 'No ROMs found.' : '');
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to fetch ROMs.');
        }
    }

    async function handleRomClick(rom) {
        navigate('/game', { state: { rom, platform } });
    }

    useEffect(() => {
        if (searchTerm.trim()) {
            fetchROMs();
        }
    }, [searchTerm, platform, region, page]);


    return (
        <div className="min-h-screen mt-16 p-4 bg-gray-100 dark:bg-gray-900">
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
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:placeholder-gray-400"
                />
                <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                >
                    <option value="all">All Platforms</option>
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
                    className="px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                >
                    <option value="">Worldwide</option>
                    <option value="us">USA</option>
                    <option value="eu">Europe</option>
                    <option value="jp">Japan</option>
                </select>
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>}
            {totalResults > 0 && <p className="text-sm text-gray-700 dark:text-gray-400 mb-2">Found {totalResults} results</p>}
            <ul className="list-none p-0">
                {roms.map((rom, index) => (
                    <li key={index} className="mb-4">
                        <div className="w-full flex items-center gap-4 p-3 rounded-md border bg-white text-gray-900 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 hover:shadow-sm transition">
                            <button
                                onClick={() => handleRomClick(rom)}
                                className="w-full flex items-center gap-4 text-left cursor-pointer"
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
                                <span className="text-left font-medium text-gray-900 dark:text-white">{rom.title || rom.name || `ROM ${index + 1}`}</span>
                            </button>

                            {/* This is the new button from the other file */}
                            <FavoriteButton rom={rom} />
                        </div>
                    </li>
                ))}
            </ul>

            {roms.length > 0 && (
                <div className="mt-4 flex items-center">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-2 border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        Previous
                    </button>
                    <span className="mx-4 text-sm text-gray-700 dark:text-gray-300">
                        Page {page} of {Math.ceil(totalResults / pageSize)}
                    </span>
                    <button
                        onClick={() => {
                            const maxPage = Math.ceil(totalResults / pageSize);
                            setPage((p) => Math.min(maxPage, p + 1));
                        }}
                        disabled={page >= Math.ceil(totalResults / pageSize)}
                        className="px-3 py-2 border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}