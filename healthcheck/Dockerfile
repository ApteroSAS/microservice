FROM ubuntu:20.04

RUN apt-get update
RUN DEBIAN_FRONTEND="noninteractive" apt-get -y install tzdata

RUN apt install -y python3
RUN apt install -y python3-pip
RUN apt install -y vim
RUN apt install -y curl
RUN apt install -y cron && touch /etc/cron.d/custom-cron 

RUN pip3 install requests

COPY ./cron/crontab.txt /etc/cron.d/custom-cron
RUN chmod 0644 /etc/cron.d/custom-cron && crontab /etc/cron.d/custom-cron && cron
RUN mkdir -p /cron/log && chmod 777 /cron && chmod 777 /cron/log
COPY ./cron/* /cron/script/
RUN chmod 777 cron/script

WORKDIR /cron/log
    
CMD /bin/bash -c cron && bash
