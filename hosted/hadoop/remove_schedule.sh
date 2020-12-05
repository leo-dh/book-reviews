#!/bin/bash
touch tmpfile
crontab tmpfile
rm -f tmpfile
