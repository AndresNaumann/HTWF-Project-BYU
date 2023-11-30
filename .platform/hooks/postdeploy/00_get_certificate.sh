#!/usr/bin/env bash
# Place in .platform/hooks/postdeploy directory
sudo certbot -n -d htwf-anauman2.is404.net --nginx --agree-tos --email andnau702@gmail.com;

sudo certbot -n -d hwtf-website-env.eba-yftev2sp.us-east-1.elasticbeanstalk.com --nginx --agree-tos --email andnau702@gmail.com;
