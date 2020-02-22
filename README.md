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

## Building images

### Openpose cpu

```sh
$ docker build . -f ./docker-images/openpose-cpu/Dockerfile -t "jonathanmv/openpose-cpu"
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

## Automatic execution on video upload

At the moment, openpose expects a `.avi` video so we need to make sure to convert the video before processing it with openpose.
