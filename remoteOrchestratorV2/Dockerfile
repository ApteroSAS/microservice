FROM node:19

##################
##install service
##################
#COPY ./node_modules ./node_modules

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
COPY ./tsconfig.json ./tsconfig.json
RUN npm i

##################
##buil service
##################
COPY ./src ./src
RUN npm run build
COPY ./public/ ./public/

COPY ./version.json ./version.json
ENV PORT 3443
EXPOSE 3443
CMD node dist/
