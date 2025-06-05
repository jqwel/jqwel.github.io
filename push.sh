#!/bin/bash

git config user.email "jqwel@example.com"
git config user.name "jqwel"

cp ~/.vimrc ./vimrc.js
git add -A .
git commit -m"add"
git push origin master
#git push origin :gh-pages
