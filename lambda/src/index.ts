import { SQSEvent, SQSHandler, S3CreateEvent } from "aws-lambda";
import {
  handle
} from './s3CreateEventHandler'

const getS3Event = (sqsEvent: SQSEvent): S3CreateEvent => {
  try {
    return JSON.parse(sqsEvent.Records[0].body);
  } catch (error) {
    console.error("Couldn't object s3 event from sqs event", sqsEvent);
    throw error;
  }
}

export const handler: SQSHandler = async (event: SQSEvent) => {
  try {
    const s3event = getS3Event(event);
    const { bucket, object } = s3event.Records[0].s3;
    const { key } = object;
    const source = `s3://${bucket.name}/${key}`;
    console.log("Handling " + source);
    await handle(source);
    console.log("Done handling " + source);
  } catch (error) {
    console.error("Failed handling event", event);
    throw error;
  }
};
