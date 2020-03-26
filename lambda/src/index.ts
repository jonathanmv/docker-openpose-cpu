import { SQSEvent, SQSHandler, S3CreateEvent } from "aws-lambda";
import {
  handle
} from './s3CreateEventHandler'
import * as AWS from 'aws-sdk';

const getS3Event = (sqsEvent: SQSEvent): S3CreateEvent => {
  try {
    return JSON.parse(sqsEvent.Records[0].body);
  } catch (error) {
    console.error("Couldn't object s3 event from sqs event", sqsEvent);
    throw error;
  }
}

const handleMessage = async (event: SQSEvent) => {
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
}

const deleteMessage = async (event: SQSEvent) => {
  try {
    const sqs = new AWS.SQS();
    const { eventSourceARN, receiptHandle } = event.Records[0];
    console.log('Deleting message with receiptHandle ' + receiptHandle);
    const QueueName = eventSourceARN.split(':').pop();
    if (!QueueName) {
      throw new Error(`Could not get the QueueUrl because no QueueName was found in QueueARN: ` + eventSourceARN);
    }

    const { QueueUrl } = await sqs.getQueueUrl({ QueueName }).promise();
    if (!QueueUrl) {
      throw new Error(`Could not delete message because no QueueUrl was found for QueueName: ` + QueueName);
    }

    await sqs.deleteMessage({ QueueUrl, ReceiptHandle: receiptHandle }).promise();
    console.log('Message deleted');
  } catch(error) {
    console.error("Failed deleting event", event);
    throw error;
  }
}

export const handler: SQSHandler = async (event: SQSEvent) => {
  await handleMessage(event);
  await deleteMessage(event);
};
