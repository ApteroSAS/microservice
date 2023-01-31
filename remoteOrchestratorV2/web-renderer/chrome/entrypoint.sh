#!/bin/bash
set -ex

python3 /app/apply_conf.py

exec supervisord -c /app/supervisord.conf
