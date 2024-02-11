FROM node:18-alpine
LABEL authors="AkshayViru"

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV PORT 1053

EXPOSE $PORT

CMD ["npm", "start"]
