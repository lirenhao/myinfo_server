#! /bin/bash test
node cluster.js &
echo $! > myinfo.pid
