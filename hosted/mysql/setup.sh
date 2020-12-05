#!/bin/bash

if [[ $# -ne 2 ]]; then
	echo Illegal number of parameters
	exit 2
fi

cd /home/ubuntu

sudo apt-get install software-properties-common -y
export DEBIAN_FRONTEND="noninteractive"
sudo debconf-set-selections <<< "mysql-server mysql-server/root_password password root"
sudo debconf-set-selections <<< "mysql-server mysql-server/root_password_again password root"
sudo apt-get update
sudo apt-get install mysql-server-5.7 -y
wget https://dbs.xuliang.dev/mysql/ingestion.sql
wget https://database-project-public.s3.amazonaws.com/kindle_reviews.csv
sudo mv kindle_reviews.csv /var/lib/mysql-files/kindle_reviews.csv
sudo mysql -e 'create database reviews' -proot
sudo mysql -e 'update mysql.user set plugin = "mysql_native_password" where user="root"' -proot
sudo mysql -e "create user '$1'@'%' identified by '$2'" -proot
sudo mysql -e "grant all privileges on *.* to '$1'@'%' with grant option" -proot
sudo mysql -e 'flush privileges' -proot
sudo bash -c 'printf "\n[mysqld]\nbind-address = 0.0.0.0\n" >> /etc/mysql/my.cnf'
sudo service mysql restart
echo Setup Complete