# proxyserve

# How to deploy on AWS EC2 Linux

## Install Node JS 
Doc : https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 14

## Create sudo shortcut
Get path with 'whereis npm' and 'whereis node'
Create shortcut 'sudo ln -s [path] /usr/bin/node' and 'sudo ln -s [path] /usr/bin/node'

## Download project
sudo mkdir /var/www
cd /var/www

git clone https://github.com/Les23Glandus/website
git clone https://github.com/Les23Glandus/strapiwebsite
git clone https://github.com/Les23Glandus/proxyserve

In each folder run 'npm install' and in website, run 'npm run build'

cd /var/www/proxyserve
cp .env.sample .env
Edit .env file

## Launch pm2
sudo npm install pm2 -g
cd /var/www/strapiwebsite
pm2 init
Edit file ecosystem.config.js
 apps : [{
    name: 'Strapi',
    script: 'npm',
    args: 'start'
  }],

sudo pm2 start ecosystem.config.js

cd /var/www/proxyserve
pm2 init
  apps : [{
    script: 'index.js',
    watch: '.'
  }, {
    script: 'admin.js',
    watch: '.'
  }],

sudo pm2 start ecosystem.config.js


sudo pm2 list


# Update

git reset --hard HEAD
git pull

