PWD = $(shell pwd)
CLOUDFORMATION_TEMPLATE = file://$(shell pwd)/cloudformation.yml
STACK = openpose-video-processor

#unset AWS vars to force authentication from provided file
export AWS_ACCESS_KEY_ID=
export AWS_SECRET_ACCESS_KEY=
export AWS_DEFAULT_REGION=eu-west-2
export AWS_CONFIG_FILE=~/.aws/openpose-config
export AWS_SHARED_CREDENTIALS_FILE=~/.aws/openpose-credentials

validate-template: cloudformation.yml
	aws cloudformation validate-template \
	--template-body $(CLOUDFORMATION_TEMPLATE)

create-stack: validate-template
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
