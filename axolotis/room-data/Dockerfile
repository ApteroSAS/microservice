FROM node:17.2.0

ENV PORT 8186
EXPOSE 8186

#COPY ./node_modules ./node_modules
#RUN npm -g ncu

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
COPY ./tsconfig.json ./tsconfig.json
RUN npm install
COPY . .
RUN npm run build

#RUN npm run test

CMD ["node", "dist/"]
