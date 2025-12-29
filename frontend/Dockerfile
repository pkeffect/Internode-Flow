FROM node:22-alpine

WORKDIR /app

# Copy package info first for caching
COPY package*.json ./
RUN npm install

# In dev mode, we don't COPY . . because we bind mount the volume in compose
# This keeps the image light and relies on your local files

EXPOSE 5173
CMD ["npm", "run", "dev"]