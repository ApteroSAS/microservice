#https://medium.com/dot-debug/running-chrome-in-a-docker-container-a55e7f4da4a8
FROM ubuntu:20.04

RUN apt update
RUN DEBIAN_FRONTEND="noninteractive" apt-get -y install tzdata

# Install git, supervisor, VNC, & X11 packages
RUN set -ex; \
    apt update \
    && apt-get install -y \
      bash \
      fluxbox \
      git \
      net-tools \
      novnc \
      supervisor \
      x11vnc \
      xterm \
      xvfb \
      python \
    && apt autoclean -y \
    && apt autoremove -y \
    && rm -rf /var/lib/apt/list

RUN set -ex; \
    apt update \
    && apt-get install -y \
      locales \
    && apt autoclean -y \
    && apt autoremove -y \
    && rm -rf /var/lib/apt/list

# #RUN apt install -y chromium-browser \
	# && wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
	# && apt-get install -y \
	# fonts-liberation \
	# libgbm1 \
	# libnspr4 \
	# libnss3 \
	# xdg-utils \
	# && dpkg -i google-chrome-stable_current_amd64.deb \
	# && rm google-chrome-stable_current_amd64.deb

RUN apt update \
    && apt install -y \
    curl \
	gpg-agent \
    firefox \
	chromium-browser \
	fonts-liberation \
	libgbm1 \
	libnspr4 \
	libnss3 \
	xdg-utils \
    && curl -LO https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && (dpkg -i ./google-chrome-stable_current_amd64.deb || apt-get install -fy) \
    && curl -sSL https://dl.google.com/linux/linux_signing_key.pub | apt-key add \
    && rm google-chrome-stable_current_amd64.deb \
    && apt autoclean -y \
    && apt autoremove -y \
    && rm -rf /var/lib/apt/lists/*

RUN apt autoclean -y \
    && apt autoremove -y \
    && rm -rf /var/lib/apt/lists/*
      
# Setup demo environment variables
ENV HOME=/root \
    DEBIAN_FRONTEND=noninteractive \
    DISPLAY=:0.0 \
    DISPLAY_WIDTH=1280 \
    DISPLAY_HEIGHT=720
	
RUN useradd -ms /bin/bash chrome
COPY . /app
COPY ./fluxbox_conf/ /home/chrome/.config/.fluxbox/

# make sure .config dir exists
RUN mkdir -p /home/chrome/.config
RUN chown chrome:chrome /home/chrome/.config
COPY --chown=chrome:chrome ./chrome_conf/ /home/chrome/.config/google-chrome

RUN mkdir -p /root/.vnc/
RUN touch /root/.vnc/passwd
RUN x11vnc -storepasswd password /root/.vnc/passwd

RUN cd /home/chrome/.config/google-chrome && chmod +x install-chrome.sh && ./install-chrome.sh

#kiosk or app
ENV URL="https://aptero.co"
#kiosk or app
ENV MODE="kiosk"
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US.UTF-8
ENV LC_ALL=C.UTF-8
#ENV KIOSK_BTN="true"
#ENV EXTENSION_LIST="[]"
#ENV PASSWORD="toto"

CMD ["/app/entrypoint.sh"]
EXPOSE 8080
