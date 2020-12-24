#!/bin/bash
cd "$(dirname "$0")"

pm2 stop ./ecosystem_prerender.config.js
pm2 start ./ecosystem_prerender.config.js

sudo pm2 stop ./ecosystem.config.js
sudo pm2 start ./ecosystem.config.js