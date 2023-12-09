FROM node:20-alpine
COPY ./package.json .
COPY ./yarn.lock .
RUN yarn install
COPY . .
RUN yarn run build

FROM nginx:1.21.3-alpine
ENV ROOT_PREFIX=service/pdf-embed-tool
RUN mkdir /usr/share/nginx/html/data
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=0 ./build/ /usr/share/nginx/html/${ROOT_PREFIX}
