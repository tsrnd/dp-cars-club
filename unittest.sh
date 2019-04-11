#!/bin/sh

# check coding convention
TSLINT_RESULT=`tslint -p tsconfig.json`
if [ $? -ne 0 ]; then
    echo "$TSLINT_RESULT"
    echo "Fail tslint check. Check log, please."
  exit 1
fi

# run unit testing
npm run test
