FROM node:16.14.0

ENV PORT 8187
EXPOSE 8187

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
COPY ./tsconfig.json ./tsconfig.json
RUN npm install

COPY ./src ./src
RUN npm run build

#RUN npm run test

CMD ["node", "dist/"]
