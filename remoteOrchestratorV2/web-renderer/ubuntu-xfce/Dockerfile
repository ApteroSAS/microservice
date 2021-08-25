#based on https://github.com/fcwu/docker-ubuntu-vnc-desktop#quick-start
FROM ubuntu:20.04

RUN apt update
RUN DEBIAN_FRONTEND="noninteractive" apt-get -y install tzdata
RUN yes | unminimize



RUN sed -i 's#http://archive.ubuntu.com/ubuntu/#mirror://mirrors.ubuntu.com/mirrors.txt#' /etc/apt/sources.list;

RUN apt update

# built-in packages
ENV DEBIAN_FRONTEND noninteractive
RUN apt install -y --no-install-recommends software-properties-common curl apache2-utils \
    && apt install -y --no-install-recommends --allow-unauthenticated \
        supervisor nginx sudo net-tools zenity xz-utils \
        dbus-x11 x11-utils alsa-utils \
        mesa-utils libgl1-mesa-dri
		
# ffmpeg
RUN apt install -y --no-install-recommends --allow-unauthenticated \
        ffmpeg \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir /usr/local/ffmpeg \
    && ln -s /usr/bin/ffmpeg /usr/local/ffmpeg/ffmpeg

RUN apt update \
    && apt install -y --no-install-recommends --allow-unauthenticated \
      novnc
	  
# install debs error if combine together
RUN apt install -y --no-install-recommends --allow-unauthenticated \
        xvfb x11vnc \
        vim-tiny ttf-ubuntu-font-family ttf-wqy-zenhei
		
# tini to fix subreap
ARG TINI_VERSION=v0.18.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /bin/tini
RUN chmod +x /bin/tini

#install synaptic
RUN apt install -y synaptic

#install browsers
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
    && rm google-chrome-stable_current_amd64.deb
	  
# install desktop
RUN apt install -y xfce4 openbox gtk2-engines gtk2-engines-murrine gtk2-engines-pixbuf
#RUN apt install -y ubuntu-unity-desktop openbox gtk2-engines-murrine gnome-themes-standard gtk2-engines-pixbuf gtk2-engines-murrine arc-theme
	  
# Additional packages
#RUN apt install -y kolourpaint
#RUN apt install -y libreoffice	  

################################################################################
# config
################################################################################

COPY rootfs /

EXPOSE 80
WORKDIR /root
ENV HOME=/home/ubuntu \
    SHELL=/bin/bash
ENTRYPOINT ["/startup.sh"]
