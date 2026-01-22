#!/bin/sh
node server.js &
node ws-server.js &
wait