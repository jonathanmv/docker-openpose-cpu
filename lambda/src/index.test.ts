import {handler} from "./index";
import {Context, S3CreateEvent} from "aws-lambda";

const buildS3CreateEvent = (key: string): S3CreateEvent => ({
    Records: [
        {
            eventVersion: "2.1",
            eventSource: "aws:s3",
            awsRegion: "eu-west-2",
            eventTime: "2020-03-04T21:46:37.846Z",
            eventName: "ObjectCreated:Put",
            userIdentity: {
                principalId: "A8KTPXBYWXBX9"
            },
            requestParameters: {
                sourceIPAddress: "37.4.254.189"
            },
            responseElements: {
                "x-amz-request-id": "835A559B87BA1EE7",
                "x-amz-id-2":
                    "NTSDSy1ykGD0EG68L4UGkRs4Tu0oIcgLeYXYXRw0iS7AI9z0uWbEtd5c5TLVbtBQcGS8unxNNL+eQa9NsRM/djUKWjJVnOME"
            },
            s3: {
                s3SchemaVersion: "1.0",
                configurationId: "0611c15d-7095-4bd4-8da0-4490d2fd8ebb",
                bucket: {
                    name: "openpose-video-processor-dev-original-bucket",
                    ownerIdentity: {
                        principalId: "A8KTPXBYWXBX9"
                    },
                    arn: "arn:aws:s3:::openpose-video-processor-dev-original-bucket"
                },
                object: {
                    key,
                    size: 2236773,
                    eTag: "4facf1ca9b03dd6079cf35b3e6e18a49",
                    sequencer: "005E6021BFA37F8898"
                }
            }
        }
    ]
});

test("creates a task to convert from mp4 to avi when a .mp4 file is put in /original folder", async () => {
    const key = "original/people.mp4";
    const event = buildS3CreateEvent(key);
    const context = {} as Context;
    const callback = () => {
    };
    await handler(event, context, callback);
});
test.todo("creates a task to process avi");
test.todo("creates a task to convert from avi to mp4");
