FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev dependencies for development)
RUN npm install

# Copy application files (node_modules and .next are excluded by .dockerignore)
COPY . .

# Expose the Next.js port
EXPOSE 3000

# Run development server with hot reload
CMD ["npm", "run", "dev"]

