import * as AWS from "aws-sdk";
import {buildEcsRunTaskRequest, CONVERT_TASK, PROCESS_TASK} from "./ecsTaskRequestBuilder";

const findOrigin = (source: string) => {
    const match = /\/(original|conversion|processing)\//.exec(source) || [];
    return match[1];
};
const findExtension = (source: string) => {
    const match = /\.(\w+)$/.exec(source) || [];
    return match[1];
};

type StringMap  = { [key: string]: string }
const taskDefinitionsMap: StringMap = {
    original: CONVERT_TASK,
    conversion: PROCESS_TASK,
    processing: CONVERT_TASK
};
const findTaskDefinition = (origin: string) => taskDefinitionsMap[origin];

const destinationsMap: StringMap = {
    original: 'conversion',
    conversion: 'processing',
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
    console.log('Found origin: ' + origin);
    const taskDefinition = findTaskDefinition(origin);
    console.log('Found taskDefinition: ' + taskDefinition);
    if (!taskDefinition) {
        console.warn(`Skipping handling because no task definition was found for ${source}`);
        return Promise.resolve();
    }

    const destination = findDestination(source, origin);
    console.log('Built destination: ' + destination);
    const commands = [source, destination];
    const request = buildEcsRunTaskRequest(taskDefinition, commands);
    const ecs = new AWS.ECS();
    try {
        const response = await ecs.runTask(request).promise();
        const {failures, tasks} = response;
        if (failures && failures.length) {
            const [failure] = failures;
            console.error(`Failed to handle ${source}:\n${failure.reason}\n${failure.detail}`);
        }
        if (tasks && tasks.length) {
            const [task] = tasks;
            console.info(`Successfully handled ${source} with:\n${task.taskDefinitionArn}`);
        }
    } catch (error) {
        console.error(`Error while running task`, request);
        throw error;
    }
};