#!/bin/bash

# Converts a file in s3 to .avi and uploads it to the specified bucket
# Expects 2 positional params:
# $1 file to be downloaded from s3
# $2 file s3 destination

# example: 
# $ ./download-process-upload.sh s3://original-bucket/process.avi s3://destination-bucket/processed.avi
# $ file uploaded to s3://destination-bucket/processed.avi

# No params can be passed to openpose for now

rnd=$RANDOM
originalFile="/tmp/original-${rnd}.avi"
processedFile="/tmp/processed-${rnd}.avi"

echo "Downloading $1"
aws s3 cp $1 $originalFile

echo "Processing $1"
cd /openpose
./build/examples/openpose/openpose.bin \
  -display 0 \
  -video $originalFile \
  -write_video $processedFile
echo "processed file $processedFile"

echo "Uploading processed file to $2"
aws s3 cp $processedFile $2

rm -f $originalFile
rm -f $processedFile

echo "File uploaded to $2"
