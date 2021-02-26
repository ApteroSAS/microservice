FROM node:14.16

ENV PORT 8192
EXPOSE 8192

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
COPY ./tsconfig.json ./tsconfig.json
RUN npm install

COPY ./src ./src
RUN npm run build

#RUN npm run test

CMD ["node", "dist/"]
