FROM node:current-alpine

RUN npm install -g pnpm

WORKDIR /usr/app

COPY package*.json pnpm-lock.yaml* ./

RUN pnpm install

COPY . .

CMD ["pnpm", "run", "dev"]
