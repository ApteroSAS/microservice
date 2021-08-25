#!/bin/bash
set -ex

sed -i 's,%VNC_HOST%,'"$VNC_HOST"',g' /app/conf.d/websockify.conf

sed -i 's,%VNC_PORT%,'"$VNC_PORT"',g' /app/conf.d/websockify.conf

exec supervisord -c /app/supervisord.conf
