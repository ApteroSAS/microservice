# Stage 1: Build the application
FROM node:20.10-alpine as builder

WORKDIR /app

# Copy package.json and yarn.lock (or package-lock.json if using npm)
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the necessary files for building the application
COPY src ./src
COPY public ./public
COPY tsconfig.json ./

# Build the application
RUN yarn run build

# Run tests (optional)
COPY jest.config.js ./
COPY .env ./
RUN yarn test

# Stage 2: Setup the production environment
FROM node:20.10-alpine

ENV PORT 8086
EXPOSE 8086

WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/dist ./dist
COPY package.json yarn.lock ./

# Install only production dependencies
RUN yarn install --production

# Copy any other files required at runtime (if any)
COPY dockflow.json ./

CMD ["node", "dist/"]
