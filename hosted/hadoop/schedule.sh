#!/bin/bash

echo "$(env)" >> tmpfile
echo "SQOOP_HOME=/usr/lib/sqoop" >> tmpfile
echo "PATH=$PATH:$SQOOP_HOME/bin" >> tmpfile
echo "0 0 * * * /home/ubuntu/ingest.sh $1 $2 $3 $4 >> cron.log 2>&1; /home/ubuntu/analytics.sh $5 >> cron.log 2>&1" >> tmpfile
crontab tmpfile
rm -f tmpfile
