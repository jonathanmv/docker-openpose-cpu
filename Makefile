CWD = $(shell pwd)

export AWS_DEFAULT_REGION=eu-west-2

validate-template: cloudformation.yml
	aws cloudformation validate-template --template-body file://$(CWD)/cloudformation.yml
