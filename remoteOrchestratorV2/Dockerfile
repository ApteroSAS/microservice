FROM ubuntu:20.04

RUN apt update -y
RUN DEBIAN_FRONTEND="noninteractive" apt-get -y install tzdata

##################
##install docker
##################
RUN apt install -y curl
RUN curl -fsSL https://get.docker.com -o get-docker.sh
RUN sh get-docker.sh

##################
##install node
##################
#https://github.com/nodesource/distributions/blob/master/README.md#debinstall
RUN apt install -y nodejs
RUN apt install -y npm

##################
##install ngingx
##################

RUN echo "deb https://nginx.org/packages/ubuntu/ focal nginx" >> /etc/apt/sources.list
RUN echo "deb-src https://nginx.org/packages/ubuntu/ focal nginx" >> /etc/apt/sources.list
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys ABF5BD827BD9BF62
RUN apt update -y
#RUN apt install -y nginx=1.20.*
RUN apt install -y nginx

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

##################
##ngingx conf
##################
COPY ./reverse_proxy_conf/nginx.conf /etc/nginx/nginx.conf
COPY ./reverse_proxy_conf/conf.d /etc/nginx/conf.d/

COPY ./startup.sh ./
ENV PORT 3443
EXPOSE 3443
CMD ./startup.sh
