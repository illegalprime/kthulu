#!/bin/bash
# Forward traffic on port 80 to port 8080
sudo sysctl net.ipv4.conf.all.forwarding=1
sudo iptables -A PREROUTING -t nat -p tcp --dport 80 -j REDIRECT --to-port 3000
