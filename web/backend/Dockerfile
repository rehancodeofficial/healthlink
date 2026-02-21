# Use a Debian-based image instead of Alpine for better OpenSSL compatibility
FROM node:22-slim

# Install system dependencies
RUN apt-get update -y && apt-get install -y openssl ca-certificates

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy source code and Prisma schema
COPY . .

# Generate Prisma Client
RUN npx prisma generate

ENV NODE_ENV=production
# Update port to 5001 as requested
EXPOSE 5001
ENV PORT=5001

# Start the application
CMD ["npm", "start"]
