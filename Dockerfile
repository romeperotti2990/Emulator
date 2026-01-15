# Use Node.js 20 Alpine as base image (Vite 7 requires Node 20+)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Expose port 3001
EXPOSE 3001

# Start the server
CMD ["node", "server.js"]