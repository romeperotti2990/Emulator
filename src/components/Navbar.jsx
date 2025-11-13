import { Link } from "react-router-dom";
import { useAuth } from '../services/AuthContext';
import { useTheme } from '../services/ThemeContext';

export default function Navbar() {
    const { token, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();

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
                            <Link to="/page" className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Search</Link>
                            <Link to="/favorites" className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Favorites</Link>

                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-500 focus:outline-none"
                                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                                aria-label="Toggle dark mode"
                            >
                                {isDark ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 3.22l.61 1.24 1.37.2-1 .98.24 1.36L10 7.5l-1.22.5.24-1.36-1-.98 1.37-.2L10 3.22zM4.22 4.22l.88.88.7-.2-.3.7.7.7-.7.7.3.7-.7-.2-.88.88-.44-1.06-.88-.2.88-.2.44-1.06-.44-1.06-.88-.2.88-.2L4.22 4.22zM17.78 4.22l-1.06.44-.2.88.2.88 1.06.44-.88.2-.44 1.06.44 1.06.88.2-.88.2L17.78 4.22zM10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-200" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M17.293 13.293A8 8 0 1 1 6.707 2.707a7 7 0 1 0 10.586 10.586z" />
                                    </svg>
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
                                        onClick={logout}
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
                            <Link to="/" className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Sign In</Link>
                            <Link to="/create" className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700">Create Account</Link>
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                                aria-label="Toggle dark mode"
                            >
                                {isDark ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 3.22l.61 1.24 1.37.2-1 .98.24 1.36L10 7.5l-1.22.5.24-1.36-1-.98 1.37-.2L10 3.22zM4.22 4.22l.88.88.7-.2-.3.7.7.7-.7.7.3.7-.7-.2-.88.88-.44-1.06-.88-.2.88-.2.44-1.06-.44-1.06-.88-.2.88-.2L4.22 4.22zM17.78 4.22l-1.06.44-.2.88.2.88 1.06.44-.88.2-.44 1.06.44 1.06.88.2-.88.2L17.78 4.22zM10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-200" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M17.293 13.293A8 8 0 1 1 6.707 2.707a7 7 0 1 0 10.586 10.586z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}