#!/bin/bash

SQOOP_HOME=/usr/lib/sqoop
PATH=$PATH:$SQOOP_HOME/bin

echo "$(date '+%Y-%m-%d %H:%M:%S'): Starting Utils Installation..."

wget -qO- https://downloads.apache.org/sqoop/1.4.7/sqoop-1.4.7.bin__hadoop-2.6.0.tar.gz | tar -xz
sudo mv sqoop-1.4.7.bin__hadoop-2.6.0 /usr/lib/sqoop
echo "export SQOOP_HOME=/usr/lib/sqoop" >> .bashrc
echo "export PATH=\$PATH:\$SQOOP_HOME/bin" >> .bashrc
pushd $SQOOP_HOME/conf > /dev/null
sudo cp sqoop-env-template.sh sqoop-env.sh
echo "export HADOOP_COMMON_HOME=/home/ubuntu/hadoop-3.3.0" | sudo tee -a sqoop-env.sh > /dev/null;
echo "export HADOOP_MAPRED_HOME=/home/ubuntu/hadoop-3.3.0" | sudo tee -a sqoop-env.sh > /dev/null
popd > /dev/null


wget -qO- https://dev.mysql.com/get/Downloads/Connector-J/mysql-connector-java-8.0.22.tar.gz | tar -xz
sudo cp mysql-connector-java-8.0.22/mysql-connector-java-8.0.22.jar $SQOOP_HOME/lib/
wget -q https://repo1.maven.org/maven2/commons-lang/commons-lang/2.6/commons-lang-2.6.jar -P $SQOOP_HOME/lib
rm -rf mysql-connector-java-8.0.22

wget -q https://leodh.s3.amazonaws.com/MongoImport.jar -O MongoImport.jar
wget -q https://dbs.xuliang.dev/hadoop/pearson.py -O pearson.py
wget -q https://dbs.xuliang.dev/hadoop/tfidf.py -O tfidf.py

cd /home/ubuntu
wget https://dbs.xuliang.dev/hadoop/analytics.sh https://dbs.xuliang.dev/hadoop/ingest.sh https://dbs.xuliang.dev/hadoop/remove_schedule.sh https://dbs.xuliang.dev/hadoop/schedule.sh
chmod +x analytics.sh ingest.sh remove_schedule.sh schedule.sh

echo "$(date '+%Y-%m-%d %H:%M:%S'): Utils Installation Completed."