#!/bin/bash

if [[ $# -ne 1 ]]; then
	echo Illegal number of parameters
	exit 2
fi

cd /home/ubuntu

sudo apt-get install software-properties-common -y
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt-get update
sudo apt-get install python3.7 python3-pip -y
python3.7 -m pip install --upgrade pip
python3.7 -m pip install virtualenv

wget https://dbs.xuliang.dev/django/launch.sh
wget https://dbs.xuliang.dev/django/migrate.sh
chmod +x launch.sh
chmod +x migrate.sh
wget https://dbs.xuliang.dev/django/source.tar.gz
tar -xzvf source.tar.gz

cd /home/ubuntu/server
python3.7 -m virtualenv env
source /home/ubuntu/server/env/bin/activate
python -m pip install -r requirements.txt

sudo apt-get install nginx -y
sudo bash -c "printf \"
server {
  listen 80;
  server_name $1;
  root /home/ubuntu/public;
  index index.html;
  location /api {
    proxy_pass \"http://127.0.0.1:8000\";
  }
}
\" >> /etc/nginx/sites-available/django"
sudo ln -s /etc/nginx/sites-available/django /etc/nginx/sites-enabled/
sudo systemctl restart nginx

echo Setup Complete