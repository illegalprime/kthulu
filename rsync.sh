#!/bin/bash
IP=$1
rsync -chavzPR $(git ls-tree -r master --name-only) $USER@$IP:/home/$USER/cde/meteor/kthulu
