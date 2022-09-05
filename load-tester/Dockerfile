FROM mcr.microsoft.com/playwright:latest

ENV PORT 8296
EXPOSE 8296

RUN npm i -g cross-env

#COPY ./node_modules ./node_modules

COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
COPY ./tsconfig.json ./tsconfig.json
RUN yarn install

COPY ./src ./src
RUN yarn run build

#RUN npm run test

CMD ["node", "dist/"]
