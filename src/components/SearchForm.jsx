import { useState } from 'react';

// Platforms supported by Emulator JS
const SUPPORTED_PLATFORMS = [
    // Nintendo Systems
    { id: 'nes', name: 'NES', brand: 'Nintendo' },
    { id: 'fds', name: 'Famicom Disk System', brand: 'Nintendo' },
    { id: 'snes', name: 'SNES', brand: 'Nintendo' },
    { id: 'gb', name: 'Game Boy', brand: 'Nintendo' },
    { id: 'gbc', name: 'Game Boy Color', brand: 'Nintendo' },
    { id: 'gba', name: 'Game Boy Advance', brand: 'Nintendo' },
    { id: 'vb', name: 'Virtual Boy', brand: 'Nintendo' },
    { id: 'n64', name: 'Nintendo 64', brand: 'Nintendo' },
    { id: 'nds', name: 'Nintendo DS', brand: 'Nintendo' },
    
    // Sega Systems
    { id: 'sms', name: 'Master System', brand: 'Sega' },
    { id: 'smd', name: 'Mega Drive / Genesis', brand: 'Sega' },
    { id: 'gg', name: 'Game Gear', brand: 'Sega' },
    { id: 'scd', name: 'Sega CD', brand: 'Sega' },
    { id: '32x', name: '32X', brand: 'Sega' },
    { id: 'sat', name: 'Sega Saturn', brand: 'Sega' },
    
    // Atari Systems
    { id: 'a26', name: 'Atari 2600', brand: 'Atari' },
    { id: 'a52', name: 'Atari 5200', brand: 'Atari' },
    { id: 'a78', name: 'Atari 7800', brand: 'Atari' },
    { id: 'lynx', name: 'Atari Lynx', brand: 'Atari' },
    { id: 'jag', name: 'Atari Jaguar', brand: 'Atari' },
    
    // Other Consoles
    { id: '3do', name: '3DO', brand: 'The 3DO Company' },
    { id: 'ps1', name: 'PlayStation', brand: 'Sony' },
    { id: 'psp', name: 'PlayStation Portable', brand: 'Sony' },
    { id: 'pcfx', name: 'PC-FX', brand: 'NEC' },
    { id: 'tg16', name: 'PC Engine / TurboGrafx-16', brand: 'NEC' },
];

export default function SearchForm({ onSearch, showRegion = true }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [platform, setPlatform] = useState('all');
    const [region, setRegion] = useState('us');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            onSearch({ searchTerm, platform, region });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-4 mb-4">
            <input
                type="text"
                placeholder="Find a game..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:placeholder-gray-400"
            />
            <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-700"
            >
                <option value="all">All Platforms</option>
                {SUPPORTED_PLATFORMS.map((plat) => (
                    <option key={plat.id} value={plat.id}>
                        {plat.name}
                    </option>
                ))}
            </select>
            {showRegion && (
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
            )}
        </form>
    );
}
