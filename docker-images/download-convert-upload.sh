#!/bin/bash

# Converts a file in s3 to .avi and uploads it to the specified bucket
# Expects 2 positional params:
# $1 file to be downloaded from s3
# $2 file s3 destination

# example: 
# $ ./download-convert-upload.sh s3://original-bucket/convert.mp4 s3://destination-bucket/convert.avi
# $ file uploaded to s3://destination-bucket/convert.avi

# No params can be passed to ffmpeg for now

rnd=$RANDOM
originalFile="/tmp/original-${rnd}"
convertedFile="/tmp/converted-${rnd}.avi"

echo "Downloading $1"
aws s3 cp $1 $originalFile

echo "Converting $1 to .avi"
ffmpeg -i $originalFile $convertedFile
echo "Converted file $convertedFile"

echo "Uploading converted file to $2"
aws s3 cp $convertedFile $2

rm -f $originalFile
rm -f $convertedFile

echo "File uploaded to $2"
