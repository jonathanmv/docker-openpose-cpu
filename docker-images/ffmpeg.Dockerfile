FROM ubuntu:18.04

# Install ffmpeg
## From https://linuxize.com/post/how-to-install-ffmpeg-on-ubuntu-18-04/
RUN echo Installing ffmpeg
RUN apt update
RUN apt install ffmpeg -y

# Install aws cli v2
## From https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-linux.html
RUN apt install curl -y
RUN apt install unzip -y
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN unzip awscliv2.zip
RUN ./aws/install

COPY ./download-convert-upload.sh /scripts/download-convert-upload.sh

WORKDIR /scripts

CMD [ "./download-convert-upload.sh" ]