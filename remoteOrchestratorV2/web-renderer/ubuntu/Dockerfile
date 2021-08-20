FROM ubuntu:20.04

RUN apt update
RUN DEBIAN_FRONTEND="noninteractive" apt-get -y install tzdata
RUN yes | unminimize

# Install git, supervisor, VNC, & X11 packages
RUN set -ex; \
    apt-get install -y \
      bash \
      fluxbox \
      git \
      net-tools \
      novnc \
      supervisor \
      x11vnc \
      xterm \
      xvfb

RUN apt install -y firefox
RUN apt install -y chromium-browser
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN set -ex; \
    apt-get install -y \
      fonts-liberation \
      libgbm1 \
      libnspr4 \
      libnss3 \
      xdg-utils
RUN dpkg -i google-chrome-stable_current_amd64.deb
      
# Setup demo environment variables
ENV HOME=/root \
    DEBIAN_FRONTEND=noninteractive \
    LANG=en_US.UTF-8 \
    LANGUAGE=en_US.UTF-8 \
    LC_ALL=C.UTF-8 \
    DISPLAY=:0.0 \
    DISPLAY_WIDTH=1280 \
    DISPLAY_HEIGHT=720 \
	URL=https://www.google.com
	
RUN useradd -ms /bin/bash chrome
COPY . /app
COPY ./fluxbox_conf/ /root/.fluxbox/
#COPY ./chrome_conf/ /root/.config/google-chrome
COPY ./chrome_conf/ /root/chromeTemp
CMD ["/app/entrypoint.sh"]
EXPOSE 8080
