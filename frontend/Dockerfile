FROM node:20-alpine

WORKDIR /app

# Copy package files first and install — this layer is cached
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose Vite dev port
EXPOSE 5173

# Fix Vite permissions
RUN chmod +x ./node_modules/.bin/vite

# Run Vite on all interfaces so it's reachable outside the container
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "5173"]
