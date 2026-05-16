FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Expose host to allow external access in dev mode
CMD ["npm", "run", "dev", "--", "--host"]
