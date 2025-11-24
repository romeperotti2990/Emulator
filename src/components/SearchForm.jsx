import { useState } from 'react';

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
                <option value="gb">Game Boy </option>
                <option value="gbc">Game Boy Color</option>
                <option value="gba">Game Boy Advance</option>
                <option value="nes">NES</option>
                <option value="snes">SNES</option>
                <option value="n64">Nintendo 64</option>
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
