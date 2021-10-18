#!/bin/bash
set -ex

python /app/apply_conf.py

exec supervisord -c /app/supervisord.conf
