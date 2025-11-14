import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './services/AuthContext';
import Page from './Page';

export default function Home() {
    const { token, favorites } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [platform, setPlatform] = useState('all');
    const [region, setRegion] = useState('us');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/page?search=${encodeURIComponent(searchTerm)}&platform=${platform}&region=${region}`);
        }
    };

    const handleFavoriteClick = (rom) => {
        if (rom.links && rom.links[0]) {
            window.open(rom.links[0].url, '_blank');
        }
    };

    return (
        <>
            <div className="mt-16 p-4 bg-gray-100 dark:bg-gray-900">
                <form onSubmit={handleSearch} className="flex gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Find a game..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch(e);
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
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-md font-medium transition"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Favorites Section */}
                {token && favorites && favorites.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Your Favorites</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {favorites.slice(0, 8).map((rom, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleFavoriteClick(rom)}
                                    className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg dark:hover:shadow-xl transition cursor-pointer border border-gray-200 dark:border-gray-700"
                                >
                                    {rom.cover_url && (
                                        <img
                                            src={rom.cover_url}
                                            alt={rom.title || rom.name}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}
                                    <div className="p-3">
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-2">
                                            {rom.title || rom.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click to play</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {favorites.length > 8 && (
                            <button
                                onClick={() => navigate('/favorites')}
                                className="mt-6 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                            >
                                View all {favorites.length} favorites →
                            </button>
                        )}
                    </section>
                )}

                {/* Info Sections */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        {token ? '🎮 Welcome Back!' : '🎮 Welcome to the Emulator'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">🔍 Search & Play</h3>
                            <p className="text-gray-700 dark:text-gray-300">
                                Use the search bar to find classic games. Filter by platform and region to find exactly what you're looking for.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">⭐ Save Favorites</h3>
                            <p className="text-gray-700 dark:text-gray-300">
                                Click the star icon to save your favorite games. They'll appear here for quick access.
                            </p>
                        </div>
                    </div>

                    {/* Fun Facts */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">� Did You Know?</h3>
                        <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                            <li className="flex items-start">
                                <span className="text-xl mr-3">🕹️</span>
                                <span><strong>Pac-Man</strong> was originally called "Puck Man" in Japan.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-xl mr-3">👾</span>
                                <span><strong>Super Mario Bros.</strong> saved the video game industry from collapse in the 1980s.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-xl mr-3">🏆</span>
                                <span><strong>Tetris</strong> has been played by over 100 million people across all platforms!</span>
                            </li>
                        </ul>
                    </div>
                </section>
            </div>
        </>
    );
}
