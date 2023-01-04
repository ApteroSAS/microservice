FROM node:16

ENV PORT 8286
EXPOSE 8286

#COPY ./node_modules ./node_modules

COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
COPY ./tsconfig.json ./tsconfig.json
RUN yarn install

COPY ./src ./src
RUN yarn run build

#RUN npm run test

CMD ["node", "dist/"]
