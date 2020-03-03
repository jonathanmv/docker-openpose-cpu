PWD = $(shell pwd)

install-dependencies:
	npm install -g typescript

build-s3-create-object-handler:
	cd $(PWD)/s3-create-object-handler && npm run clean && npm run build