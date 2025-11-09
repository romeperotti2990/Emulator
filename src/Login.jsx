import { useState } from "react";
import { Link } from "react-router";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const handleClick = () => {
        const exists = users.some((u) => u.email === email && u.password === password);
        if (exists) {
            window.location.href = "/page";
        } else {
            alert("Username or password incorrect")
        }
    };

    return (
        <>
            <h1>Sign in</h1>
            <p>new? <Link to="/create">create an account.</Link></p>
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
                    Sign in
                </button>
            </form>
        </>
    );
}