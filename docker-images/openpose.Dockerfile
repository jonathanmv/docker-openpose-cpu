FROM ubuntu:18.04

LABEL maintainer="me@jonathanmv.com"
LABEL description="CPU-only version of OpenPose. Not slimmed for production."
LABEL version="1.0"

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update -y && \
    apt-get upgrade -y && \
    apt-get install wget apt-utils lsb-core cmake git -y && \
    apt-get install libopencv-dev -y

RUN git clone https://github.com/CMU-Perceptual-Computing-Lab/openpose.git

WORKDIR /openpose

RUN git checkout caa794cf81bed53b9e114299b715a6d972097b5b

WORKDIR /openpose/scripts/ubuntu

RUN sed -i 's/\<sudo -H\>//g' install_deps.sh; \
    sed -i 's/\<sudo\>//g' install_deps.sh; \
    sed -i 's/\<easy_install pip\>//g' install_deps.sh; \
    sync; sleep 1; bash install_deps.sh

WORKDIR /openpose/build

RUN cmake -DGPU_MODE:String=CPU_ONLY \
    -DDOWNLOAD_BODY_MPI_MODEL:Bool=ON \
    -DDOWNLOAD_BODY_COCO_MODEL:Bool=ON \
    -DDOWNLOAD_FACE_MODEL:Bool=ON \
    -DDOWNLOAD_HAND_MODEL:Bool=ON \
    -DUSE_MKL:Bool=OFF \
    ..

RUN make -j 4 # yolo

RUN apt-get remove wget unzip cmake git build-essential -y && apt-get autoremove -y

# Install aws cli v2
## From https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-linux.html
RUN apt install curl -y
RUN apt install unzip -y
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN unzip awscliv2.zip
RUN ./aws/install

COPY ./download-process-upload.sh /scripts/download-process-upload.sh

WORKDIR /scripts

CMD ["./download-process-upload.sh"]
