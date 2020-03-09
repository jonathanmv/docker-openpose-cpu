PWD=$(shell pwd)
APP_NAME=openpose-video-processor
ENV=dev
BASE_NAME=$(APP_NAME)-$(ENV)
CLOUDFORMATION_STACK=$(BASE_NAME)-original-cloudformation-stack
CLOUDFORMATION_TEMPLATE=file://$(PWD)/cloudformation.yml
ECR_ENDPOINT=472551880915.dkr.ecr.eu-west-2.amazonaws.com/$(BASE_NAME)-original-ecr-repository

#unset AWS vars to force authentication from provided file
export AWS_ACCESS_KEY_ID=
export AWS_SECRET_ACCESS_KEY=
export AWS_DEFAULT_REGION=eu-west-2
export AWS_CONFIG_FILE=~/.aws/openpose-config
export AWS_SHARED_CREDENTIALS_FILE=~/.aws/openpose-credentials

validate-template: cloudformation.yml
	aws cloudformation validate-template \
	--template-body $(CLOUDFORMATION_TEMPLATE)

delete-stack: validate-template
	aws cloudformation delete-stack \
	--stack-name $(CLOUDFORMATION_STACK)

create-stack: validate-template
	aws cloudformation create-stack \
	--stack-name $(CLOUDFORMATION_STACK) \
	--parameters ParameterKey=AppName,ParameterValue=$(APP_NAME) ParameterKey=Environment,ParameterValue=$(ENV) \
	--template-body $(CLOUDFORMATION_TEMPLATE)

deploy-stack: validate-template
	aws cloudformation deploy \
	--stack-name $(CLOUDFORMATION_STACK) \
	--template-file cloudformation.yml

describe-stack-events:
	aws cloudformation describe-stack-events \
	--stack-name $(CLOUDFORMATION_STACK) \

### Read how to authenticate to the registry https://docs.aws.amazon.com/AmazonECR/latest/userguide/Registries.html#registry_auth
ecr-login:
	aws ecr get-login --no-include-email | sh

ecr-build:
	docker build -t openpose-video-processor .

ecr-tag:
	docker tag openpose-video-processor:latest $(ECR_ENDPOINT):latest

ecr-push:
	docker push $(ECR_ENDPOINT):latest

ecr-ffmpeg-build:
	docker build -t ffmpeg -f ./docker-images/ffmpeg.Dockerfile ./docker-images

ecr-ffmpeg-tag:
	docker tag ffmpeg:latest $(ECR_ENDPOINT):latest

ecr-ffmpeg-push:
	docker push $(ECR_ENDPOINT):latest
