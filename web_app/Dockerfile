# Stage 1: Base - Shared environment
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Development - Hot reloading
FROM base AS development
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# Stage 3: Builder - Build the production assets
FROM base AS builder
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 4: Production - Server with Nginx
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]