import {handler} from "./index";
import {Context, S3CreateEvent} from "aws-lambda";
import AWS from 'aws-sdk';

import {CONVERT_TASK, PROCESS_TASK} from "./ecsTaskRequestBuilder";

const mockRunTask = jest.fn();
jest.mock("aws-sdk", () => ({
    ECS: jest.fn(() => ({
        runTask: mockRunTask.mockImplementation(() => ({
            promise: () => ({})
        }))
    }))
}));

const BUCKET_NAME = "openpose-video-processor-dev-original-bucket";
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
                    name: BUCKET_NAME,
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

beforeEach(() => {
    mockRunTask.mockClear();
});

interface ExpectedRunTaskParams {
    taskDefinition: string;
    destination: string;
}

test.each([
    ['original/people.mp4', {taskDefinition: CONVERT_TASK, destination: 'conversion/people.avi'}],
    ['original/people.mov', {taskDefinition: CONVERT_TASK, destination: 'conversion/people.avi'}],
    ['original/people.MP4', {taskDefinition: CONVERT_TASK, destination: 'conversion/people.avi'}],
    ['original/people.MP4.mp4', {taskDefinition: CONVERT_TASK, destination: 'conversion/people.MP4.avi'}],
    ['conversion/people.avi', {taskDefinition: PROCESS_TASK, destination: 'processing/people.avi'}],
    ['processing/people.avi', {taskDefinition: CONVERT_TASK, destination: 'processed/people.mp4'}],
])('handles "%s" with "%o"', async (key: string, expectedParams: ExpectedRunTaskParams) => {
    const event = buildS3CreateEvent(key);
    const context = {} as Context;
    const callback = () => {
    };
    await handler(event, context, callback);

    const taskParams = mockRunTask.mock.calls[0][0] as AWS.ECS.Types.RunTaskRequest;
    const containerOverrides = taskParams.overrides!.containerOverrides![0];
    const {command} = containerOverrides;
    const {taskDefinition} = taskParams;
    expect(taskDefinition).toBe(expectedParams.taskDefinition);
    expect(command).toEqual([
        `s3://${BUCKET_NAME}/${key}`,
        `s3://${BUCKET_NAME}/${expectedParams.destination}`
    ]);
});

test.each([
    ['invalid-origin/people.mp4', 0],
    ['processed/people.mp4', 0],
    ['original/people.mp4', 1],
    ['conversion/people.mp4', 1],
    ['processing/people.mp4', 1],
])('', async (key: string, numberOfCalls: number) => {
    const event = buildS3CreateEvent(key);
    const context = {} as Context;
    const callback = () => {
    };
    await handler(event, context, callback);

    expect(mockRunTask.mock.calls.length).toBe(numberOfCalls);
});