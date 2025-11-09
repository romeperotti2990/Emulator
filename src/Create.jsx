import { useState } from "react";
import { Link } from "react-router";

export default function Create() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [users, setUsers] = useState(() => {
        const stored = localStorage.getItem("users");
        return stored ? JSON.parse(stored) : [];
    });

    const addUser = (email, password) => {
        // avoid duplicates by email
        if (users.some((u) => u.email === email)) return;
        const updated = [...users, { email, password }];
        setUsers(updated);
        localStorage.setItem("users", JSON.stringify(updated));
    };

    const handleClick = () => {
        if (!email.trim() || !password) {
            alert("Please enter both email and password.");
            return;
        }

        const exists = users.some((u) => u.email === email);
        if (exists) {
            alert("A user with that email already exists.");
            return;
        }

        console.log("Button clicked", { email, password });
        addUser(email, password);
        alert("Account created.");
    };

    return (
        <>
            <h1>Create an account</h1>
            <p>Been here before? <Link to="/">Sign in.</Link></p>
            <form>
                <label>
                    email:
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>
                <br />
                <label>
                    password:
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>
                <br />
                <button type="button" onClick={handleClick}>
                    Create Account
                </button>
            </form>
        </>
    );
}