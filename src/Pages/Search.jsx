import { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SearchForm from '../components/SearchForm';
import FavoriteButton from '../components/FavoriteButton';
import PaginationControls from '../components/PaginationControls';

// Supported platforms that can be emulated
const SUPPORTED_PLATFORM_IDS = [
    'nes', 'fds', 'snes', 'gb', 'gbc', 'gba', 'vb', 'n64', 'nds',
    'sms', 'smd', 'gg', 'scd', '32x', 'sat',
    'a26', 'a52', 'a78', 'lynx', 'jag',
    '3do', 'ps1', 'psp', 'pcfx', 'tg16'
];

export default function Search() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [platform, setPlatform] = useState('all');
    const [region, setRegion] = useState('us');
    const [error, setError] = useState('');
    const [roms, setRoms] = useState([]);
    const [page, setPage] = useState(1);
    const [pageInput, setPageInput] = useState('1');
    const [totalResults, setTotalResults] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const pageInputRef = useRef(null);

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

            // Build platforms filter
            if (platform && platform !== 'all') {
                // map 'gb' to both gb and gbc for broader coverage
                if (platform === 'gb') {
                    requestBody.platforms = ['gb', 'gbc'];
                } else {
                    requestBody.platforms = [platform];
                }
            } else if (platform === 'all') {
                // When "All Platforms" is selected, only search for supported platforms
                requestBody.platforms = SUPPORTED_PLATFORM_IDS;
            }

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/api/crocdb`, {
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
    }, [searchTerm, platform, region, page, pageSize]);

    useEffect(() => {
        if (pageInputRef.current !== document.activeElement) {
            setPageInput(page.toString());
        }
    }, [page]);

    const handleSearchFormSubmit = ({ searchTerm: newSearchTerm, platform: newPlatform, region: newRegion }) => {
        setSearchTerm(newSearchTerm);
        setPlatform(newPlatform);
        setRegion(newRegion);
        setPage(1);
        fetchROMs(newSearchTerm, newPlatform, newRegion, 1);
    };

    return (
        <div className="mt-16 p-4 bg-gray-100 dark:bg-gray-900">
            <SearchForm onSearch={handleSearchFormSubmit} />

            {error && <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>}
            {totalResults > 0 && <p className="text-sm text-gray-700 dark:text-gray-400 mb-2">Found {totalResults} results</p>}
            {roms.length > 0 && <div className="mb-2"><PaginationControls page={page} setPage={setPage} totalResults={totalResults} pageSize={pageSize} setPageSize={setPageSize} pageInput={pageInput} setPageInput={setPageInput} pageInputRef={pageInputRef} showPageSizeSelector={true} /></div>}
            <ul className="list-none p-0">
                {roms.map((rom, index) => (
                    <li key={index} className="mb-4">
                        <div onClick={() => handleRomClick(rom)} className="w-full flex items-center gap-4 p-3 rounded-md border bg-white text-gray-900 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 hover:shadow-sm transition hover:bg-gray-700 cursor-pointer">
                            <button className="w-full flex items-center gap-4 text-left cursor-pointer">
                                {rom.boxart_url ? (
                                    <img
                                        key={rom.boxart_url}
                                        src={
                                            rom.boxart_url.startsWith('http')
                                                ? (() => { const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'; return `${apiUrl}/api/proxy-image?url=${encodeURIComponent(rom.boxart_url)}`; })()
                                                : rom.boxart_url
                                        }
                                        alt={rom.title}
                                        className="w-20 h-20 rounded-sm object-contain bg-gray-700"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.style?.removeProperty('display'); }}
                                    />
                                ) : null}
                                {!rom.boxart_url && (
                                    <div className="w-20 h-20 rounded-sm bg-gray-700 flex items-center justify-center shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <rect x="3.5" y="4.5" width="17" height="15" rx="2" ry="2" />
                                            <path d="M8 13l2.5 3L14 11l4 6" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                                <span className="text-left font-medium text-gray-900 dark:text-white">{rom.title || rom.name}</span>
                            </button>

                            <FavoriteButton item={rom} variant="list" />
                        </div>
                    </li>
                ))}
            </ul>

            {roms.length > 0 && (
                <div className="mt-4">
                    <PaginationControls page={page} setPage={setPage} totalResults={totalResults} pageSize={pageSize} setPageSize={setPageSize} pageInput={pageInput} setPageInput={setPageInput} pageInputRef={pageInputRef} showPageSizeSelector={true} />
                </div>
            )}
        </div>
    );
}