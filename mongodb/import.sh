#!/bin/bash

mongoimport --db database \
  --collection metadata \
  --drop \
  --file /data/mongodb/kindle_metadata_stream.json

mongosh admin --eval "db.createUser({user: '$MONGO_USER', pwd: '$(<$MONGO_PASSWORD_FILE)', roles: [{role: 'userAdminAnyDatabase', db: 'admin'}, {role: 'dbAdminAnyDatabase', db: 'admin'}, {role: 'readWriteAnyDatabase', db: 'admin'}]})"
