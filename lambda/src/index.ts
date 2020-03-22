import { S3CreateEvent, S3Handler } from "aws-lambda";
import {
  handle
} from './s3CreateEventHandler'

export const handler: S3Handler = async (event: S3CreateEvent) => {
  const { bucket, object } = event.Records[0].s3;
  const { key } = object;
  const source = `s3://${bucket.name}/${key}`;
  console.log("Handling " + source);
  try {
    await handle(source);
    console.log("Done handling " + source);
  } catch (error) {
    console.error("Failed handling " + source);
    throw error;
  }
};
