#!/bin/bash

echo "$(date '+%Y-%m-%d %H:%M:%S'): Starting Spark Installation..."

sudo rm -rf /home/ubuntu/spark-3.0.1-bin-hadoop3.2
sudo wget https://downloads.apache.org/spark/spark-3.0.1/spark-3.0.1-bin-hadoop3.2.tgz
sudo tar zxf spark-3.0.1-bin-hadoop3.2.tgz
sudo rm spark-3.0.1-bin-hadoop3.2.tgz
cp spark-3.0.1-bin-hadoop3.2/conf/spark-env.sh.template spark-3.0.1-bin-hadoop3.2/conf/spark-env.sh

echo -e "
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
export HADOOP_HOME=/home/ubuntu/hadoop-3.3.0
export SPARK_HOME=/home/ubuntu/spark-3.0.1-bin-hadoop3.2
export SPARK_CONF_DIR=\${SPARK_HOME}/conf
export HADOOP_CONF_DIR=\${HADOOP_HOME}/etc/hadoop
export YARN_CONF_DIR=\${HADOOP_HOME}/etc/hadoop
export SPARK_EXECUTOR_CORES=1
export SPARK_EXECUTOR_MEMORY=2G
export SPARK_DRIVER_MEMORY=1G
export PYSPARK_PYTHON=python3
" >> spark-3.0.1-bin-hadoop3.2/conf/spark-env.sh

echo "$(date '+%Y-%m-%d %H:%M:%S'): Spark Installation Completed."
