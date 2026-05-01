FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY client/ ./client/
RUN cd client && npm install && npm run build

COPY server/ ./server/
RUN cd server && npm install && npx prisma generate && npm run build

COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 4000

CMD ["sh", "start.sh"]
