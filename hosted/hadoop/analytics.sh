#!/bin/bash

analytics_pearson () {
  /home/ubuntu/spark-3.0.1-bin-hadoop3.2/bin/spark-submit --master yarn pearson.py $1 >> analytics_pearson.log 2>&1
  /home/ubuntu/hadoop-3.3.0/bin/hdfs dfs -getmerge /output/pearson ~/results/latest_pearson.txt
  echo "$(date '+%Y-%m-%d %H:%M:%S'): Pearson Correlation Computation Completed."
}

analytics_tfidf () {
  /home/ubuntu/spark-3.0.1-bin-hadoop3.2/bin/spark-submit --master yarn tfidf.py $1 >> analytics_tfidf.log 2>&1
  /home/ubuntu/hadoop-3.3.0/bin/hdfs dfs -getmerge /output/tfidf ~/results/latest_tfidf.txt
  echo "$(date '+%Y-%m-%d %H:%M:%S'): TF-IDF Computation Completed."
}

echo "$(date '+%Y-%m-%d %H:%M:%S'): Starting analytics..."
/home/ubuntu/spark-3.0.1-bin-hadoop3.2/sbin/start-all.sh

/home/ubuntu/hadoop-3.3.0/bin/hdfs dfs -rm -r /output
analytics_pearson $1 &
analytics_tfidf $1 &
wait

/home/ubuntu/spark-3.0.1-bin-hadoop3.2/sbin/stop-all.sh
echo "$(date '+%Y-%m-%d %H:%M:%S'): Analytics Completed."
