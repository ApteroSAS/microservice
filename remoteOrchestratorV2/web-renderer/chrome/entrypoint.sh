#!/bin/bash
set -ex

echo $URL
sed -i 's,%URL%,'"$URL"',g' /app/conf.d/chrome.conf

sed -i 's,%MODE%,'"$MODE"',g' /app/conf.d/chrome.conf

sed -i 's,%KIOSK_URL%,'"$URL"',g' /home/chrome/.config/google-chrome/kiosk-button/js/fullScreener.js

if [ $KIOSK_BTN = "true" ]; then
	echo "KIOSK BTN activated"
	sed -i 's|%ADDITIONAL_EXT%|'",/home/chrome/.config/google-chrome/kiosk-button/"'|g' /app/conf.d/chrome.conf
else
	sed -i 's,%ADDITIONAL_EXT%,'""',g' /app/conf.d/chrome.conf
fi

#change password
x11vnc -storepasswd $PASSWORD /root/.vnc/passwd

exec supervisord -c /app/supervisord.conf
