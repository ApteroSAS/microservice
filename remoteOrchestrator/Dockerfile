FROM node:15.2.0

ENV PORT 3443
EXPOSE 3443

RUN curl -fsSL https://get.docker.com | sh;

COPY ./node_modules ./node_modules

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
COPY ./tsconfig.json ./tsconfig.json

COPY ./src ./src
RUN npm run build

#RUN npm run test

CMD ["node", "dist/"]
