import {S3Handler, S3CreateEvent} from 'aws-lambda';
//https://github.com/awslabs/s3-managed-download-js/blob/master/package.json
export const handler: S3Handler = async (event: S3CreateEvent) => {
    console.log(event.Records[0].s3.object.key);

    /**
     * It should start an ecs task giving the s3 object information
     *
     * The bucket receives files from many sources
     * - original:
     *  Files uploaded by the user
     * - converted:
     *  Files taken from original and converted into .avi
     * - processed:
     *  Files taken from converted and processed with openpose
     * - rendered:
     *  Files taken from original and processed and merged together
     *
     * In each case it need to make sure that the file has the right
     * prefix [original, converted, etc] and suffix [.mp4,.avi]
     */
}
