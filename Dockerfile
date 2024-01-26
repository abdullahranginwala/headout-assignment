FROM --platform=$BUILDPLATFORM node:lts

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

ENV NODE_OPTIONS="--max-old-space-size=1500"
ENV CPU_LIMIT="2000m"

CMD ["node", "index.js"]
