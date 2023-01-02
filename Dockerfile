FROM --platform=linux/amd64 node:14.13.0-alpine3.11

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run compile:all

CMD [ "node", "dist/index.js" ]
