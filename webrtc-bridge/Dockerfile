FROM node:14.16

RUN apt update
RUN apt install -y python3-pip
RUN pip3 install numpy
RUN pip3 install cython
RUN pip3 install k-means-constrained

ENV PORT 8195
EXPOSE 8195

#COPY ./node_modules ./node_modules

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
COPY ./tsconfig.json ./tsconfig.json
RUN npm install

COPY ./src ./src
RUN npm run build

#RUN npm run test

CMD ["node", "dist/"]
