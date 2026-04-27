FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm ci  && npm cache clean --force

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 5000 5173

CMD ["npm", "run", "dev:all"]