import { S3CreateEvent, S3Handler } from "aws-lambda";
import {
  handle
} from './s3CreateEventHandler'

const s3Uri = (bucket: string, key: string) => `s3://${bucket}/${key}`;

export const handler: S3Handler = async (event: S3CreateEvent) => {
  const { bucket, object } = event.Records[0].s3;
  const { key } = object;
  const source = s3Uri(bucket.name, key);
  console.log("Handling...");
  await handle(source);

  console.log("Done handling " + source);
};
