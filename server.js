import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import bcrypt from 'bcryptjs';      // Still needed for hashing
import jwt from 'jsonwebtoken';     // Still needed for tokens
import { Low } from 'lowdb';        // <-- NEW: lowdb
import { JSONFile } from 'lowdb/node'; // <-- NEW: To read/write the JSON file

// --- App Setup ---
const app = express();
app.use(cors());
app.use(express.json());

// --- Database Setup ---
const file = './db.json'; // This is your database file
const adapter = new JSONFile(file);
const db = new Low(adapter, { users: [] }); // Default data: an empty user list
await db.read(); // Load the database from the file

const JWT_SECRET = "ilovevideogamessomuchicouldjustmarryoneexceptthatineedtofindarealgirlfriendohgodimgoingtodiealoneimmakinganemulatorforcolledge"; // Make this long and random

// --- 1. ACCOUNT ROUTES (Using lowdb) ---

// SIGNUP
app.post('/api/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        // Find user in the db.data.users array
        const existingUser = db.data.users.find(
            u => u.username === username.toLowerCase()
        );
        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = {
            id: Date.now().toString(), // Simple unique ID
            username: username.toLowerCase(),
            passwordHash,
            favorites: []
        };

        db.data.users.push(user);
        await db.write(); // <-- Save to db.json file

        res.status(201).json({ message: 'User created successfully.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the user
        const user = db.data.users.find(
            u => u.username === username.toLowerCase()
        );
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials.' });
        }

        // Create a token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: { username: user.username, favorites: user.favorites, id: user.id }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- 2. MIDDLEWARE (Unchanged) ---

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token, authorization denied.' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId; // Add the userId to the request
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid.' });
    }
};

// --- 3. FAVORITES ROUTES (Using lowdb) ---

app.get('/api/favorites', authMiddleware, async (req, res) => {
    try {
        const user = db.data.users.find(u => u.id === req.userId);
        res.json(user.favorites);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/favorites', authMiddleware, async (req, res) => {
    try {
        const rom = req.body;
        const user = db.data.users.find(u => u.id === req.userId);

        const romUrl = rom.links[0].url;
        const romIndex = user.favorites.findIndex(f => f.links[0].url === romUrl);

        if (romIndex > -1) {
            user.favorites = user.favorites.filter(f => f.links[0].url !== romUrl);
        } else {
            user.favorites.push(rom);
        }

        await db.write(); // <-- Save to db.json file

        res.json(user.favorites);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


// --- 4. YOUR EXISTING PROXY ROUTES ---
// (These are unchanged)

app.post('/api/crocdb', async (req, res) => {
    try {
        const response = await fetch('https://api.crocdb.net/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error('CrocDB fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch from CrocDB' });
    }
});

app.get('/api/proxy-image', async (req, res) => {
    const { url } = req.query;
    if (!url) { return res.status(400).send('Missing URL'); }
    try {
        const response = await fetch(url);
        if (!response.ok) { return res.status(response.status).send('Failed to fetch image'); }
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', response.headers.get('content-type') || 'image/png');
        response.body.pipe(res);
    } catch (err) {
        console.error('Image proxy error:', err);
        res.status(500).send('Image proxy error');
    }
});

app.get('/api/proxy-rom', async (req, res) => {
    const romUrl = req.query.url;
    if (!romUrl || !romUrl.startsWith('http')) {
        return res.status(400).send('Invalid ROM URL');
    }
    try {
        const response = await fetch(romUrl);
        if (!response.ok) {
            return res.status(response.status).send('Failed to fetch ROM');
        }
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
        response.body.pipe(res);
    } catch (err) {
        console.error('ROM proxy error:', err);
        res.status(500).send('Server error');
    }
});

// --- Server Start ---
app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});