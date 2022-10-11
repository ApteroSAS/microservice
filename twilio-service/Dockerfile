FROM node:16

ENV PORT 8194
EXPOSE 8194

COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
COPY ./tsconfig.json ./tsconfig.json
RUN yarn

COPY ./src ./src
RUN yarn build

#RUN npm run test

CMD ["node", "dist/"]
