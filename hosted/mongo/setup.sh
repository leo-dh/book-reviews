#!/bin/bash

if [[ $# -ne 2 ]]; then
	echo Illegal number of parameters
	exit 2
fi

cd /home/ubuntu 

wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
sudo apt-get update
sudo apt-get install mongodb-org -y
sudo systemctl start mongod
sleep 10
wget https://database-project-public.s3.amazonaws.com/kindle_metadata_stream.json
mongoimport --db database --collection metadata --drop --file /home/ubuntu/kindle_metadata_stream.json
mongo admin --eval "db.createUser({user: '$1', pwd: '$2', roles: [{role: 'userAdminAnyDatabase', db: 'admin'}, {role: 'dbAdminAnyDatabase', db: 'admin'}, {role: 'readWriteAnyDatabase', db: 'admin'}]})"
sudo sed -i 's/bindIp: 127.0.0.1/bindIp: 0.0.0.0/g' /etc/mongod.conf
sudo bash -c "printf \"\nsecurity:\n  authorization: 'enabled'\n\" >> /etc/mongod.conf"
sudo systemctl restart mongod
echo Setup Complete