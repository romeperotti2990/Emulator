// This is your complete proxy.js file
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

// CrocDB search proxy
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

// ✅ NEW IMAGE PROXY (Fixes blocked images)
app.get('/api/proxy-image', async (req, res) => {
    const { url } = req.query;
    if (!url) { return res.status(400).send('Missing URL'); }
    try {
        const response = await fetch(url);
        if (!response.ok) { return res.status(response.status).send('Failed to fetch image'); }

    // Allow embedding in cross-origin-isolated pages and enable CORS
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers.get('content-type') || 'image/png');

        response.body.pipe(res);
    } catch (err) {
        console.error('Image proxy error:', err);
        res.status(500).send('Image proxy error');
    }
});

// ROM file proxy
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

    // Allow embedding in cross-origin-isolated pages and enable CORS
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

app.listen(3001, () => {
    console.log('Proxy running on http://localhost:3001');
});