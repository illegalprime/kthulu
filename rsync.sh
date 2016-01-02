#!/bin/bash
IP=$1
cd $(dirname $0)

rsync -chavzP . $USER@$IP:/home/$USER/cde/meteor/
