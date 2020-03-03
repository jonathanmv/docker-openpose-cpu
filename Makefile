PWD=$(shell pwd)
CLOUDFORMATION_TEMPLATE=file://$(shell pwd)/cloudformation.yml
STACK=openpose-video-processor
ECR_ENDPOINT=472551880915.dkr.ecr.eu-west-2.amazonaws.com

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
	--stack-name $(STACK)

create-stack: validate-template
	aws cloudformation create-stack \
	--stack-name $(STACK) \
	--template-body $(CLOUDFORMATION_TEMPLATE)

deploy-stack: validate-template
	aws cloudformation deploy \
	--stack-name $(STACK) \
	--template-file cloudformation.yml

describe-stack-events:
	aws cloudformation describe-stack-events \
	--stack-name $(STACK) \

### Read how to authenticate to the registry https://docs.aws.amazon.com/AmazonECR/latest/userguide/Registries.html#registry_auth
ecr-print-login:
	aws ecr get-login --no-include-email

ecr-build:
	docker build -t openpose-video-processor .

ecr-tag:
	docker tag openpose-video-processor:latest $(ECR_ENDPOINT)/openpose-video-processor:latest

ecr-push:
	docker push $(ECR_ENDPOINT)/openpose-video-processor:latest