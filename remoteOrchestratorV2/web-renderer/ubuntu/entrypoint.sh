#!/bin/bash
set -ex

echo $URL
sed -i 's,%URL%,'"$URL"',g' /app/conf.d/chrome.conf

exec supervisord -c /app/supervisord.conf
