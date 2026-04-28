# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build args for Vite env vars
ARG VITE_API_URL=http://localhost:3001
ARG VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
ARG VITE_APPWRITE_PROJECT_ID
ARG VITE_AI_URL=http://localhost:8000

# Set as env so Vite picks them up during build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APPWRITE_ENDPOINT=$VITE_APPWRITE_ENDPOINT
ENV VITE_APPWRITE_PROJECT_ID=$VITE_APPWRITE_PROJECT_ID
ENV VITE_AI_URL=$VITE_AI_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
