FROM node:16.17

ENV PORT 8086
EXPOSE 8086

#COPY ./node_modules ./node_modules

COPY ./package.json ./package.json
#COPY ./package-lock.json ./package-lock.json
COPY ./yarn.lock ./yarn.lock
RUN yarn install

COPY . .
RUN yarn run build

#RUN npm run test

CMD ["node", "dist/"]
