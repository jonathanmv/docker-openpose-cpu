import * as AWS from "aws-sdk";
import {buildEcsRunTaskRequest, CONVERT_TASK, PROCESS_TASK} from "./ecsTaskRequestBuilder";

const findOrigin = (source: string) => {
    const match = /\/(original|converted|processing)\//.exec(source) || [];
    return match[1];
};
const findExtension = (source: string) => {
    const match = /\.(\w+)$/.exec(source) || [];
    return match[1];
};

type StringMap  = { [key: string]: string }
const taskDefinitionsMap: StringMap = {
    original: CONVERT_TASK,
    converted: PROCESS_TASK,
    processing: CONVERT_TASK
};
const findTaskDefinition = (origin: string) => taskDefinitionsMap[origin];

const destinationsMap: StringMap = {
    original: 'converted',
    converted: 'processing',
    processing: 'processed'
};
const extensionConversionMap: StringMap = {
    original: 'avi',
    processing: 'mp4'
};
const findDestination = (source: string, origin: string) => {
    const destination = destinationsMap[origin];
    let finalDestination = source.replace(`/${origin}/`, `/${destination}/`);
    const extension = findExtension(source);
    const extensionConversion = extensionConversionMap[origin];
    if (extensionConversion) {
        finalDestination = finalDestination.replace(extension, extensionConversion);
    }
    return finalDestination;
};

export const handle = async (source: string) => {
    const origin = findOrigin(source);
    const taskDefinition = findTaskDefinition(origin);
    if (!taskDefinition) {
        console.warn(`Skipping handling because no task definition was found for ${source}`);
        return Promise.resolve();
    }

    const destination = findDestination(source, origin);
    const commands = [source, destination];
    const request = buildEcsRunTaskRequest(taskDefinition, commands);
    const ecs = new AWS.ECS();
    const response = await ecs.runTask(request).promise();
    console.log(response);
};