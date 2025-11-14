import { useAuth } from '../services/AuthContext'; // <-- NEW
import { useNavigate } from 'react-router-dom'; // <-- NEW

function FavoriteButton({ rom }) {
    const { favorites, toggleFavorite } = useAuth(); // Get global state
    const isFavorited = Array.isArray(favorites) && favorites.some(f => f?.links?.[0]?.url && rom?.links?.[0]?.url && f.links[0].url === rom.links[0].url);

    const handleToggle = (e) => {
        e.stopPropagation();
        toggleFavorite(rom);
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

export default function Favorites() {
    const { favorites } = useAuth(); // <-- Get favorites from context
    const navigate = useNavigate();

    const handleFavoriteClick = (rom) => {
        // This is a simple way to play a favorited game.
        // It just navigates to the Page component, which will load the emulator.
        // A more advanced way would be to pass the rom object, but this is fine.
        alert("To play a favorited game, please find it in the Search page for now. This is a known limitation.");

        // A better long-term solution would be to make your /page route
        // accept a ROM object as state:
        // navigate('/page', { state: { romToLoad: rom } });
        // And then Page.jsx would check for this state.
    }

    return (
        <div className="min-h-screen mt-16 p-4 bg-gray-100 dark:bg-gray-900">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Your Favorites</h1>

            {(!Array.isArray(favorites) || favorites.length === 0) ? (
                <p className="text-gray-700 dark:text-gray-300">You haven't favorited any games yet. Find games on the Search page and click the star!</p>
            ) : (
                <ul className="list-none p-0">
                    {favorites.map((rom, index) => (
                        <li key={index} className="mb-4">
                            <div className="w-full flex items-center gap-4 p-3 rounded-md border bg-white text-gray-900 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 hover:shadow-sm transition">
                                <button
                                    onClick={() => handleFavoriteClick(rom)}
                                    className="flex-1 flex items-center gap-4 text-left"
                                >
                                    {rom.boxart_url && (
                                        <img
                                            src={
                                                rom.boxart_url.startsWith('http')
                                                    ? `http://localhost:3001/api/proxy-image?url=${encodeURIComponent(rom.boxart_url)}`
                                                    : rom.boxart_url
                                            }
                                            alt={rom.title}
                                            className="w-20 h-auto rounded-sm object-contain"
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        />
                                    )}
                                    <span className="font-medium text-gray-900 dark:text-white">{rom.title || rom.name || `ROM ${index + 1}`}</span>
                                </button>
                                <FavoriteButton rom={rom} />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}