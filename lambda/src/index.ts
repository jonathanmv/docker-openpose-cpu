import {S3CreateEvent, S3Handler} from 'aws-lambda'

type S3Object = { bucket: string, key: string }
interface ObjectHandler {
    prefix: string;
    handle: (object: S3Object) => Promise<void>;
}

const s3Uri = ({ bucket, key }: S3Object) => `s3://${bucket}/${key}`;

const noopObjectHandler: ObjectHandler = {
    prefix: '',
    handle: async object => console.warn(`noop object handler for: `, object)
};

const originalObjectHandler: ObjectHandler = {
    prefix: 'original',
    handle: async object => console.info(`should start converting: `, object)
};

const convertedObjectHandler: ObjectHandler = {
    prefix: 'converted',
    handle: async object => console.info(`should start processing: `, object)
};

const objectHandlers: ObjectHandler[] = [
    originalObjectHandler,
    convertedObjectHandler
];

const findObjectHandler = (key: string) => {
    const objectHandler = objectHandlers.find(({prefix}) => key.startsWith(prefix));
    if (!objectHandler) {
        return noopObjectHandler;
    }

    return objectHandler;
};


export const handler: S3Handler = async (event: S3CreateEvent) => {
    const {bucket, object} = event.Records[0].s3;
    const {key} = object;
    const s3Object: S3Object = { bucket: bucket.name, key };
    const uri = s3Uri(s3Object);
    console.log('Looking for a handler for ' + uri);
    const handler = findObjectHandler(key);
    console.log('Handling...');
    await handler.handle(s3Object);

    console.log('Done handling ' + uri);
};