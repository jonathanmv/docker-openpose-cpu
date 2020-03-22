import { S3CreateEvent, S3Handler } from "aws-lambda";
import AWS from "aws-sdk";
import {
  buildEcsRunTaskRequest,
  CONVERT_TASK,
  PROCESS_TASK
} from './ecsTaskRequestBuilder'

type S3Object = { bucket: string; key: string };
interface ObjectHandler {
  prefix: string;
  handle: (object: S3Object) => Promise<void>;
}

const s3Uri = ({ bucket, key }: S3Object) => `s3://${bucket}/${key}`;

const noopObjectHandler: ObjectHandler = {
  prefix: "",
  handle: async object => console.warn(`noop object handler for: `, object)
};

const originalObjectHandler: ObjectHandler = {
  prefix: "original",
  handle: async object => {
    const ecs = new AWS.ECS();
    const source = s3Uri(object);
    const destinationObject = {
      ...object,
      key: object.key.replace('original', 'converted')
    };
    const destination = s3Uri(destinationObject);
    const commands = [source, destination];
    const task = CONVERT_TASK;
    const request = buildEcsRunTaskRequest(task, commands);
    const response = await ecs.runTask(request).promise();
    console.log(response);
  }
};

const convertedObjectHandler: ObjectHandler = {
  prefix: "converted",
  handle: async object => {
    const ecs = new AWS.ECS();
    const source = s3Uri(object);
    const destinationObject = {
      ...object,
      key: object.key.replace('converted', 'processing')
    };
    const destination = s3Uri(destinationObject);
    const commands = [source, destination];
    const task = PROCESS_TASK;
    const request = buildEcsRunTaskRequest(task, commands);
    const response = await ecs.runTask(request).promise();
    console.log(response);
  }
};

const processedObjectHandler: ObjectHandler = {
  prefix: "processing",
  handle: async object => {
    const ecs = new AWS.ECS();
    const source = s3Uri(object);
    const destination = object.key
      .replace('processing','processed')
      .replace('.avi', '.mp4');
    const commands = [source, destination];
    const task = CONVERT_TASK;
    const request = buildEcsRunTaskRequest(task, commands);
    const response = await ecs.runTask(request).promise();
    console.log(response);
  }
};

const objectHandlers: ObjectHandler[] = [
  originalObjectHandler,
  convertedObjectHandler,
  processedObjectHandler
];

const findObjectHandler = (key: string) => {
  const objectHandler = objectHandlers.find(({ prefix }) =>
    key.startsWith(prefix)
  );
  if (!objectHandler) {
    return noopObjectHandler;
  }

  return objectHandler;
};

export const handler: S3Handler = async (event: S3CreateEvent) => {
  const { bucket, object } = event.Records[0].s3;
  const { key } = object;
  const s3Object: S3Object = { bucket: bucket.name, key };
  const uri = s3Uri(s3Object);
  console.log("Looking for a handler for " + uri);
  const handler = findObjectHandler(key);
  console.log("Handling...");
  await handler.handle(s3Object);

  console.log("Done handling " + uri);
};
