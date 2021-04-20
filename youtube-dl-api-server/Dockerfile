FROM ubuntu:20.04

RUN apt update && apt -y upgrade
RUN DEBIAN_FRONTEND="noninteractive" apt-get -y install tzdata
RUN apt install git -y

RUN apt install python3-pip -y

# https://github.com/mozillareality/youtube-dl-api-server
# https://github.com/mozilla/hubs-ops/blob/4a353b156f123262026af3450e8f91b60f9709f5/plans/youtube-dl-api-server/habitat/plan.sh

RUN git clone https://github.com/worph/youtube-dl-api-server.git
WORKDIR /youtube-dl-api-server
RUN python3 setup.py sdist
RUN pip3 install "dist/youtube_dl_server-0.4.tar.gz"
RUN pip3 install gunicorn
RUN rm -rf dist build

CMD youtube-dl-server --host 0.0.0.0 --port 9191 --number-processes 5
 