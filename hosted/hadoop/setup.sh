#!/bin/bash

if [[ $# -ne 1 ]]; then
  echo Illegal number of parameters
  exit 2
fi

cd /home/ubuntu

sudo apt-get install software-properties-common -y
sudo apt-get update
sudo apt-get install openjdk-8-jdk -y

wget https://downloads.apache.org/hadoop/common/hadoop-3.3.0/hadoop-3.3.0.tar.gz
tar -xzf hadoop-3.3.0.tar.gz
rm hadoop-3.3.0.tar.gz

sudo mkdir -p /mnt/hadoop/datanode
sudo mkdir -p /mnt/hadoop/namenode/hadoop-${USER}
sudo chown -R ubuntu:ubuntu /mnt/hadoop/datanode
sudo chown -R ubuntu:ubuntu /mnt/hadoop/namenode

printf "
export HADOOP_HOME=/home/ubuntu/hadoop-3.3.0
export HADOOP_INSTALL=\$HADOOP_HOME
export HADOOP_MAPRED_HOME=\$HADOOP_HOME
export HADOOP_COMMON_HOME=\$HADOOP_HOME
export HADOOP_HDFS_HOME=\$HADOOP_HOME
export YARN_HOME=\$HADOOP_HOME
export HADOOP_COMMON_LIB_NATIVE_DIR=$HADOOP_HOME/lib/native
export PATH=\$PATH:\$HADOOP_HOME/sbin:\$HADOOP_HOME/bin
export HADOOP_OPTS=\"-Djava.library.path=\$HADOOP_HOME/lib/native\"
" >> .bashrc

cd /home/ubuntu/hadoop-3.3.0/etc/hadoop

sed -i 's/# export JAVA_HOME=/export JAVA_HOME=\/usr\/lib\/jvm\/java-8-openjdk-amd64/g' hadoop-env.sh

sed -i 's/<\/configuration>//g' hdfs-site.xml
printf "
<property>
  <name>dfs.namenode.name.dir</name>
  <value>file:/mnt/hadoop/namenode</value>
</property>
<property>
  <name>dfs.datanode.data.dir</name>
  <value>file:/mnt/hadoop/datanode</value>
</property>
<property>
  <name>dfs.replication</name>
  <value>3</value>
</property>
</configuration>
" >> hdfs-site.xml

sed -i 's/<\/configuration>//g' mapred-site.xml
printf "
<property>
  <name>mapreduce.framework.name</name>
  <value>yarn</value>
</property>
<property>
  <name>yarn.app.mapreduce.am.env</name>
  <value>HADOOP_MAPRED_HOME=/home/ubuntu/hadoop-3.3.0/</value>
</property>
<property>
  <name>mapreduce.map.env</name>
  <value>HADOOP_MAPRED_HOME=/home/ubuntu/hadoop-3.3.0/</value>
</property>
<property>
  <name>mapreduce.reduce.env</name>
  <value>HADOOP_MAPRED_HOME=/home/ubuntu/hadoop-3.3.0/</value>
</property>
</configuration>
" >> mapred-site.xml

sed -i 's/<\/configuration>//g' yarn-site.xml
printf "
<property>
  <name>yarn.nodemanager.aux-services</name>
  <value>mapreduce_shuffle</value>
</property>
<property>
  <name>yarn.nodemanager.aux-services.mapreduce_shuffle.class</name>
  <value>org.apache.hadoop.mapred.ShuffleHandler</value>
</property>
<property>
  <name>yarn.resourcemanager.hostname</name>
  <value>$1</value>
</property>
<property>
  <name>yarn.acl.enable</name>
  <value>0</value>
</property>
<property>
  <name>yarn.nodemanager.env-whitelist</name>   
  <value>JAVA_HOME,HADOOP_COMMON_HOME,HADOOP_HDFS_HOME,HADOOP_CONF_DIR,CLASSPATH_PERPEND_DISTCACHE,HADOOP_YARN_HOME,HADOOP_MAPRED_HOME</value>
</property>
</configuration>
" >> yarn-site.xml

sed -i 's/<\/configuration>//g' core-site.xml
printf "
<property>
  <name>fs.defaultFS</name>
  <value>hdfs://$1:9000/</value>
</property>
</configuration>
" >> core-site.xml

echo Hadoop installation complete