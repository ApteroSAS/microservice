FROM node:14.13.1

RUN apt-get update
RUN apt-get install -y \
	unzip \
	tar \
	curl \
	bzip2 \
	libfreetype6 \
	libgl1-mesa-dev \
	libglu1-mesa \
	libxi6 \
	libxrender1 
    
RUN apt-get install -y -qqy x11-apps
RUN apt-get install -y xterm

RUN apt-get install -y mesa-common-dev
RUN apt-get install -y libosmesa6-dev
RUN apt-get install -y libglu1-mesa-dev

RUN apt-get install -y xvfb
RUN apt-get install -y xz-utils

RUN apt-get -y install libglu1-mesa-dev freeglut3-dev mesa-common-dev xbase-clients xterm xvfb vnc4server x11-apps mesa-utils

RUN apt-get -y install libgtkextra-dev libgconf2-dev libnss3 libasound2 libxtst-dev libxss1
RUN apt-get -y install libgtk-3-0

RUN apt-get -y autoremove
RUN rm -rf /var/lib/apt/lists/*

RUN mkdir /workspace/
RUN chmod 777 /workspace/
RUN useradd -ms /bin/bash main
USER main
WORKDIR /workspace/

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm install

COPY ./server.js ./server.js

USER root
RUN chown root:root /workspace/node_modules/electron/dist/chrome-sandbox
RUN chmod 4755 /workspace/node_modules/electron/dist/chrome-sandbox
USER main

ENV PORT 3443
EXPOSE 3443

ENV width 1024
ENV height 768
#-e width='1024' -e height='768'

CMD ["/bin/sh", "-c", "/usr/bin/xvfb-run -a -s \"-screen 0 ${width}x${height}x24\" node_modules/.bin/electron . ${width} ${height}"]
#CMD ["/bin/sh", "-c", "/usr/bin/xvfb-run -a -s \"-screen 0 ${width}x${height}x24\" npm run start-electron"]
#CMD ["npm", "run", "start-electron"]
