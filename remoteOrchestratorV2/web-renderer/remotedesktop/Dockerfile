FROM ubuntu:20.04

# Install git, supervisor, VNC, & X11 packages
RUN set -ex; \
    apt update \
    && apt-get install -y \
      novnc \
      supervisor \
    && apt autoclean -y \
    && apt autoremove -y \
    && rm -rf /var/lib/apt/list

COPY . . /app/

CMD ["/app/entrypoint.sh"]
EXPOSE 8080
