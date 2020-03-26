#!/bin/bash
set -e

# Converts a file in s3 to .avi and uploads it to the specified bucket
# Expects 2 positional params:
# $1 file to be downloaded from s3
# $2 file s3 destination

# example:
# $ ./download-convert-upload.sh s3://original-bucket/convert.mp4 s3://destination-bucket/convert.avi
# $ file uploaded to s3://destination-bucket/convert.avi

# No params can be passed to ffmpeg for now

rnd=$RANDOM
basePath="/tmp/convert-${rnd}"
mkdir -p $basePath

originalFileName=$(basename ${1})
convertedFileName=$(basename ${2})
originalFilePath="${basePath}/$originalFileName"
convertedFilePath="${basePath}/$convertedFileName"

echo "Downloading $1"
aws s3 cp $1 $originalFilePath

echo "Converting $1"
ffmpeg -i $originalFilePath $convertedFilePath
echo "Converted file $convertedFilePath"

echo "Uploading converted file to $2"
aws s3 cp $convertedFilePath $2

rm -f $originalFilePath
rm -f $convertedFilePath

echo "File uploaded to $2"
