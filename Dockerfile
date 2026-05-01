FROM node:20-alpine

WORKDIR /app

# install root deps (concurrently etc.)
COPY package*.json ./
RUN npm install

# build client
COPY client/ ./client/
RUN cd client && npm install && npm run build

# build server (prisma generate happens here, migrate deploy at runtime)
COPY server/ ./server/
RUN cd server && npm install && npx prisma generate && npm run build

EXPOSE 4000

CMD ["sh", "-c", "cd server && npx prisma migrate deploy && node dist/index.js"]
