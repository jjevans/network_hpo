#!/usr/bin/env python
import sys
import subprocess

try:
    filename = sys.argv[1]
except:
    print "usage: cp_to_s3.py filename"
    exit(1)

cmd = "aws s3 cp "+filename+" s3://aws-website-tron-e37nv"

print "running: "+cmd
subprocess.check_call(cmd, shell=True)
print "success."

exit()

