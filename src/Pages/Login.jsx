import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../services/AuthContext';

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); // For error messages
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleClick = async (e) => {
        e.preventDefault(); // Stop form from refreshing page
        setError(""); // Clear old errors

        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Invalid username or password.");
            } else {
                login(data.user, data.token); // <-- Save user and token to context
                navigate('/'); // Navigate to home page after login
            }
        } catch (err) {
            setError("Could not connect to server. Is it running?");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-none p-8">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Sign in</h1>
                <p className="text-sm text-gray-500 dark:text-gray-300 mb-6">
                    New here?{" "}
                    <Link to="/create" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Create an account.
                    </Link>
                </p>

                <form className="space-y-5" onSubmit={handleClick}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Your username"
                            className="w-full px-4 py-2 border border-gray-200 rounded-md bg-white text-gray-900 placeholder-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            autoComplete="username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border border-gray-200 rounded-md bg-white text-gray-900 placeholder-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            autoComplete="current-password"
                        />
                    </div>

                    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow hover:cursor-pointer"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}