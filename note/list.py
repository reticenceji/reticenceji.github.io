#!/usr/bin/python3
import os
import os.path
import urllib.parse

url = "https://reticenceji.github.io/note/"
work_dir = "."
for entry in os.scandir(work_dir):
    if entry.is_file() and entry.name!='list.py':
        index = entry.name.rfind('.')
        print("[{}]({})".format(entry.name[0:index],url+urllib.parse.quote(entry.name)))