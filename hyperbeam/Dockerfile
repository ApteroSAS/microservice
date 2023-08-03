FROM node:18.17.0

ENV PORT 8286
EXPOSE $PORT

COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
COPY ./tsconfig.json ./tsconfig.json
RUN yarn install

COPY ./src ./src
COPY ./public ./public
COPY ./version.json ./version.json
RUN yarn run build


CMD ["node", "dist/"]
