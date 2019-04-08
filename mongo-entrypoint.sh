#!/bin/sh
echo "Create user for mongodb"
mongo --authenticationDatabase admin --host localhost -u myuser -p mypass --eval "db.getSiblingDB('mydb').createUser({user: 'myuser', pwd: 'mypass', roles: [{ role: 'readWrite', db:'mydb'}]});"
