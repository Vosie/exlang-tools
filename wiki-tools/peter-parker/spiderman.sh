#!/bin/bash
checkFile () {
  echo "check file: $1"
  if [ -s "$1" ];
  then
    return "1"
  else
    return "0"
  fi
}

sendPeterParker () {
  node --expose_gc index.js $1 $2 $3
}

runLine () {
  target="$4/$2"
  checkFile $target
  if [ "$?" == "1" ];
  then
    echo ">>>>> $1 already parsed to $target"
  else
    sendPeterParker $1 $3 $target
  fi
}

while read line; do
  runLine $line $2 $3
done < $1
