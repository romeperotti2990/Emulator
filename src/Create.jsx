import { useState } from "react";
import { Link } from "react-router";

export default function Create() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [users, setUsers] = useState(() => {
        const stored = localStorage.getItem("users");
        return stored ? JSON.parse(stored) : [];
    });

    const addUser = (username, password) => {
        // avoid duplicates by username
        if (users.some((u) => u.username === username)) return;
        const updated = [...users, { username, password }];
        setUsers(updated);
        localStorage.setItem("users", JSON.stringify(updated));
    };

    const handleClick = () => {
        if (!username.trim() || !password) {
            alert("Please enter both username and password.");
            return;
        }

        const exists = users.some((u) => u.username === username);
        if (exists) {
            alert("That username is already taken, sorry.");
            return;
        }

        console.log("Button clicked", { username, password });
        addUser(username, password);
        alert("Account created.");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Create an account</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Been here before?{" "}
                    <Link to="/" className="text-blue-600 hover:underline">
                        Sign in.
                    </Link>
                </p>

                <form className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Your username"
                            className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            autoComplete="username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            autoComplete="new-password"
                        />
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={handleClick}
                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-md shadow hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
                        >
                            Create Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}