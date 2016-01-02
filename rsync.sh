#!/bin/bash
IP=$1
rsync -chavzP "$(dirname $0)" $USER@$IP:/home/$USER/cde/meteor/kthulu
