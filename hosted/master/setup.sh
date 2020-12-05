#!/bin/bash

cd /home/ubuntu
mkdir /home/ubuntu/.aws

sudo apt-get install software-properties-common -y
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt-get update
sudo apt-get install python3.7 python3-pip -y
python3.7 -m pip install --upgrade pip
python3.7 -m pip install boto3 paramiko python-dotenv

wget https://dbs.xuliang.dev/master/analytics.py
wget https://dbs.xuliang.dev/master/automate.py
wget https://dbs.xuliang.dev/master/launch.py
wget https://dbs.xuliang.dev/master/scale.py
wget https://dbs.xuliang.dev/master/teardown.py

python3.7 launch.py