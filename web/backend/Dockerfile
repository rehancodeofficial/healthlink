FROM node:22-alpine
WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

ENV NODE_ENV=production
EXPOSE 5000

# Use tini if available or just start
CMD ["npm", "start"]
