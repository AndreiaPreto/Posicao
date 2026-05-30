# Step 1: Use an official Node.js runtime as the base image
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy dependency files first for caching optimization
COPY package*.json ./

# Install all dependencies (including devDependencies needed for building)
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the frontend assets and bundle the backend server
RUN npm run build

# Step 2: Create the production image to keep it lightweight
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies (faster install, smaller image, safer)
RUN npm install --omit=dev --ignore-scripts

# Copy compiled build output (frontend + server) from builder stage
COPY --from=builder /app/dist ./dist

# Copy optional configuration files if they exist (non-blocking)
COPY --from=builder /app/firebase-applet-config.json* ./
COPY --from=builder /app/firebase-blueprint.json* ./
COPY --from=builder /app/firestore.rules* ./

# Expose port (Cloud Run will inject PORT environment variable, but 3000 is default)
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
