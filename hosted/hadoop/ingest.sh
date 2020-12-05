#!/bin/bash

SQOOP_HOME=/usr/lib/sqoop
PATH=$PATH:$SQOOP_HOME/bin

ingest_sql () {
  sqoop import \
    --connect jdbc:mysql://$1/reviews?useSSL=false \
    --username $2 \
    --password $3 \
    --table reviews_review \
    --columns "asin,text" \
    --delete-target-dir \
    --target-dir "/input/reviews" >> sql_ingestion.log 2>&1
  echo "$(date '+%Y-%m-%d %H:%M:%S'): Reviews Ingestion Completed."
}

ingest_mongo () {
  # Input splits do not write to HDFS for some reason
  # username:password@ip:port
  hdfs dfs -rm -r /input/metadata
  /home/ubuntu/hadoop-3.3.0/bin/hadoop jar MongoImport.jar $1 >> mongo_ingestion.log 2>&1
  echo "$(date '+%Y-%m-%d %H:%M:%S'): Metadata Ingestion Completed."
}

echo "$(date '+%Y-%m-%d %H:%M:%S'): Starting ingestion..."
ingest_sql $1 $2 $3 &
ingest_mongo $4 &
wait
echo "$(date '+%Y-%m-%d %H:%M:%S'): Data Ingestion Completed."
