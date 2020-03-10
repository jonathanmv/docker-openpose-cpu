PWD=$(shell pwd)
APP_NAME=openpose-video-processor
ENV=dev
BASE_NAME=$(APP_NAME)-$(ENV)
CLOUDFORMATION_STACK=$(BASE_NAME)-original-cloudformation-stack
CLOUDFORMATION_TEMPLATE=file://$(PWD)/cloudformation.yml

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
	--stack-name $(CLOUDFORMATION_STACK)

# ECR

# ECR_ENDPOINT=472551880915.dkr.ecr.eu-west-2.amazonaws.com/$(BASE_NAME)-original-ecr-repository
ECR_ENDPOINT=472551880915.dkr.ecr.eu-west-2.amazonaws.com
ECR_OPENPOSE_IMG_NAME=$(BASE_NAME)-openpose-ecr-image
ECR_OPENPOSE_IMG_URL=${ECR_ENDPOINT}/$(ECR_OPENPOSE_IMG_NAME)
ECR_FFMPEG_IMG_NAME=$(BASE_NAME)-ffmpeg-ecr-image
ECR_FFMPEG_IMG_URL=${ECR_ENDPOINT}/$(ECR_FFMPEG_IMG_NAME)

### Read how to authenticate to the registry https://docs.aws.amazon.com/AmazonECR/latest/userguide/Registries.html#registry_auth
ecr-login:
	aws ecr get-login --no-include-email | sh

ecr-openpose-build:
	docker build -t ${ECR_OPENPOSE_IMG_NAME} .

ecr-openpose-tag:
	docker tag ${ECR_OPENPOSE_IMG_NAME}:latest $(ECR_OPENPOSE_IMG_URL):latest

ecr-openpose-push:
	docker push $(ECR_OPENPOSE_IMG_URL):latest

ecr-ffmpeg-build:
	docker build -t ${ECR_FFMPEG_IMG_NAME} .

ecr-ffmpeg-tag:
	docker tag ${ECR_FFMPEG_IMG_NAME}:latest $(ECR_FFMPEG_IMG_URL):latest

ecr-ffmpeg-push:
	docker push $(ECR_FFMPEG_IMG_URL):latest
