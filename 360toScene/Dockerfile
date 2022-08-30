FROM node:16.15.0
ENV PORT 3000
EXPOSE 3000

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
COPY ./tsconfig.json ./tsconfig.json

RUN npm install

COPY ./src ./src
COPY ./assets ./assets

RUN npm run build

CMD ["node", "dist/"]