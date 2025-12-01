# Deployment Instructions

## Frontend (Netlify)

Your React app is deployed on Netlify. To set the backend URL:

1. Go to your Netlify site dashboard
2. Click **Site Settings** → **Build & Deploy** → **Environment**
3. Click **Add environment variables**
4. Add: `VITE_API_URL=https://your-backend-url.com` (without trailing slash)
5. Redeploy the site

## Backend (Node.js Server)

Your backend is currently hardcoded to run on `localhost:3001`. You need to deploy it to a service like:

### Option 1: Render (Recommended for Node.js)
1. Go to https://render.com
2. Create a new Web Service
3. Connect your GitHub repo
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node server.js`
6. Environment Variables:
   - Add any needed variables from your `.env` file
7. Deploy

Once deployed, you'll get a URL like `https://your-app-12345.onrender.com`

Then set `VITE_API_URL=https://your-app-12345.onrender.com` in Netlify

### Option 2: Railway
Similar process at https://railway.app

## Local Development

For local development, the app uses `.env.local`:
```
VITE_API_URL=http://localhost:3001
```

This is already set up, so running `npm run dev` locally will use your local Node.js server.

## CORS Configuration

Make sure your `server.js` allows requests from your Netlify domain. Update the CORS middleware if needed.

Current CORS origins:
- http://localhost:3000 (local dev)
- http://localhost (local)

You may need to add your Netlify domain if you get CORS errors.
