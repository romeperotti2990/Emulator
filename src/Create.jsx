import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Correct import

export default function Create() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); // For errors
    const navigate = useNavigate(); // For redirecting

    // We no longer read/write to localStorage here
    // const [users, setUsers] = useState(...)
    // const addUser = (...)

    const handleClick = async (e) => {
        e.preventDefault(); // Stop form from refreshing page
        setError(""); // Clear old errors

        if (!username.trim() || !password) {
            setError("Please enter both username and password.");
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to create account.");
            } else {
                alert("Account created! Please sign in.");
                navigate('/'); // Redirect to login page
            }
        } catch (err) {
            setError("Could not connect to server.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-none p-8">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Create an account</h1>
                <p className="text-sm text-gray-500 dark:text-gray-300 mb-6">
                    Been here before?{" "}
                    <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Sign in.
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
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            autoComplete="new-password"
                        />
                    </div>

                    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow"
                        >
                            Create Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}