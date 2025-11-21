import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../services/AuthContext';
import { useTheme } from '../services/ThemeContext';

export default function Navbar() {
    const { token, logout, recentGames } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
        window.location.reload()
    };

    const handleLastGame = () => {
        if (recentGames && recentGames.length > 0) {
            navigate('/game', { state: { rom: recentGames[0], platform: 'all' } });
        }
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 shadow">
            <div className="px-6">
                <div className="flex h-16 items-center"> {/* Fixed height */}
                    <div className="flex items-center mr-auto">
                        <Link to="/" className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                            Emulator
                        </Link>
                    </div>

                    {token && (
                        <div className="hidden md:flex items-center space-x-4">
                            <Link to="/" className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
                            <button onClick={handleLastGame} className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:cursor-pointer">Last Game</button>

                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-500 focus:outline-none"
                                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                                aria-label="Toggle dark mode"
                            >
                                {isDark ? (
                                    <span className="text-2xl" aria-hidden="true">🔆</span>
                                ) : (
                                    <span className="text-2xl" aria-hidden="true">🌙</span>
                                )}
                            </button>

                            <details className="relative">
                                <summary className="flex items-center cursor-pointer list-none p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none">
                                    <span className="sr-only">Open profile menu</span>
                                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                        <svg className="h-5 w-5 text-gray-600 dark:text-gray-200" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v1.6h19.2v-1.6c0-3.2-6.4-4.8-9.6-4.8z" />
                                        </svg>
                                    </div>
                                </summary>

                                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg dark:shadow-none py-1 z-50">
                                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Profile</Link>
                                    <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Settings</Link>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            </details>
                        </div>
                    )}

                    {/* Show login/signup if NOT logged in */}
                    {!token && (
                        <div className="hidden md:flex items-center space-x-4">
                            <Link to="/login" className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Sign In</Link>
                            <Link to="/create" className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700">Create Account</Link>
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                                aria-label="Toggle dark mode"
                            >
                                {isDark ? (
                                    <span className="text-2xl" aria-hidden="true">🔆</span>
                                ) : (
                                    <span className="text-2xl" aria-hidden="true">🌙</span>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}