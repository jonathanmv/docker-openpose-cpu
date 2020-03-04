# Dockerfile for OpenPose CPU-only

## Overview

The goal of this Dockerfile is to build OpenPose with the purpose of using the `openpose/openpose.bin` example.

I couldn't find a working CPU-only variant for Docker, so I created this to enable some local testing.

I've done absolutely nothing to reduce the size of the image. As such I'm not pushing it to Dockerhub.

### What it does

- Downloads all 3 body models: BODY_25, COCO, and MPI
- Downloads hand and foot models
- Builds Caffe from source
- Disables MKL
  - When trying to compile with MKL I ran into issues. It's probably an easy fix.

## Docker images

### Openpose cpu

```sh
$ docker build . -f ./docker-images/openpose-cpu/Dockerfile -t "jonathanmv/openpose-cpu"
```

### FFMPEG (Optional)

As I understand, openpose can process `.avi` videos only, so if you need to process a video which is not in the `.avi` format pulling this docker helps you

```sh
$ docker pull jrottenberg/ffmpeg
```

## Usage

Create images and videos folders by running `mkdir -p data/images data/videos`. Place your files accordingly.

```sh
# basic usage, runs --help
$ docker run jonathanmv/openpose-cpu:latest
```

```sh
# process image file(s) in ./data/images directory
$ docker run -v`pwd`/data:/data -it jonathanmv/openpose-cpu -display 0 -image_dir /data/images -write_images /data/images
```

```sh
# process a single video in avi format
$ docker run -v`pwd`/data:/data -it jonathanmv/openpose-cpu -display 0 -video /data/videos/video.avi -write_video /data/videos/video_rendered.avi
```

```sh
# convert video from .mp4 to .avi
$ docker run -v`pwd`/data:/data -it jrottenberg/ffmpeg -i /data/videos/video.mp4 /data/videos/video.avi
```

## Automatic execution on video upload

The way I would like it to work is that I upload a video to S3 and some time later I get an email with a link to download the processed video.

Let's break it down into conversion, processing and notification.

### Conversion

1. A new file is uploaded to the `s3://original-source` bucket by the user
2. A sqs message is sent by s3 to the `sqs://new-original-source` queue
3. A lambda is dispatched by sqs
4. The lambda starts a new `jrottenberg/ffmeg` based ecs task `ecs-task://process-new-original-source` giving it the sqs message
5. The ecs task reads the video from `s3://original-source`, converts it to `.avi` and uploads the converted file to the `s3://converted-source` bucket.

### Processing

1. A new file is uploaded to the `s3://converted-source` bucket from the previous step
2. A sqs message is sent by s3 to the `sqs://new-converted-source` queue
3. A lambda is dispatched by sqs
4. The lambda starts a new `jonathanmv/openpose-cpu` based ecs task `ecs-task://process-new-converted-source` giving it the sqs message
5. The ecs task reads the video from `s3://converted-source`, processes it and uploads the converted file to the `s3://processed-source` bucket.

### Notification

1. A new file is uploaded to the `s3://processed-source` bucket from the previous step
2. A sns notification is sent to the `sns://new-processed-source` topic. You must be subscribed it in order to receive the email.

# Cloudformation

There is a [cloudformation.yml](./cloudformation.yml) file that will create resources for you.

To create the stack you need to make sure that you have a credentials and cofig files located in `~/.aws/openpose-credentials` and `~/.aws/openpose-config` respectively (see [Makefile](./Makefile)). These files are created by running `aws configure`.

Once you have your credentials and cofig files in place you can create the stack by running `make create-stack`.
A manual step you need to do is to build the openpose docker image and push it to the ECR Repository. To do so, you need to run the following commands:

```
make ecr-build
make ecr-tag
make ecr-login
make ecr-tag
make ecr-push
```
