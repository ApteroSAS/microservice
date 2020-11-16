FROM risingstack/alpine:3.7-v8.10.0-4.8.0

ENV PORT 8186
EXPOSE 8186

COPY ./node_modules ./node_modules

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
COPY ./tsconfig.json ./tsconfig.json

COPY ./src ./src
RUN npm run build

#RUN npm run test

CMD ["node", "dist/"]
