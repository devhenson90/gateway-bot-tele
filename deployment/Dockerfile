FROM node:20-bullseye as builder
WORKDIR /app
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm install --force
COPY . .
RUN npm run build

FROM node:20-bullseye
WORKDIR /app
COPY --from=builder /app ./
COPY .env .env
EXPOSE 5300
CMD ["npm", "run", "start:prod"]
