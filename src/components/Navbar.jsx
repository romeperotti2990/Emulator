import { Link } from "react-router";

export default function Navbar() {

    return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow">
            <div className="px-6">
                <div className="flex h-full">
                    <div className="flex items-center mr-auto">
                        <Link to="/" className="text-4xl p-5 font-semibold text-gray-900">
                            Emulator
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/home" className="text-sm text-gray-700 hover:text-blue-600">Home</Link>
                        <Link to="/page" className="text-sm text-gray-700 hover:text-blue-600">Search</Link>
                        <Link to="/favorites" className="text-sm text-gray-700 hover:text-blue-600">Favorites</Link>
                        <details className="relative">
                            <summary className="flex items-center cursor-pointer list-none p-1 rounded-full hover:bg-gray-100 focus:outline-none">
                                <span className="sr-only">Open profile menu</span>
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <svg className="h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v1.6h19.2v-1.6c0-3.2-6.4-4.8-9.6-4.8z" />
                                    </svg>
                                </div>
                            </summary>

                            <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg py-1 z-50">
                                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                                <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</Link>
                                <Link to="/signout" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</Link>
                            </div>
                        </details>
                    </div>
                </div>
            </div>
        </nav>
    );
}