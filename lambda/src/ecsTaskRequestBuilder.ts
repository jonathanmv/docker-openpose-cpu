import * as AWS from 'aws-sdk';

const ensureEnvVar = (name: string): string => {
  if (Object.keys(process.env).includes(name)) {
    return process.env[name]!;
  }
  throw new Error(`Required environment var "${name}" is not set`);
};


export const CONVERT_TASK = ensureEnvVar('ECS_TASK_CONVERT');
export const PROCESS_TASK = ensureEnvVar('ECS_TASK_PROCESS');
const cluster = ensureEnvVar('ECS_CLUSTER');

// https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_RunTask.html#API_RunTask_RequestParameters
export const buildEcsRunTaskRequest = (
  taskDefinition: string,
  commands: string[]
): AWS.ECS.Types.RunTaskRequest => ({
  cluster,
  count: 1,
  launchType: "FARGATE",
  networkConfiguration: {
    awsvpcConfiguration: {
      assignPublicIp: "ENABLED",
      // securityGroups are Optional
      securityGroups: ["openpo-3702"], // cluster vpc vpc-4d14d125 (172.31.0.0/16)
      subnets: ["subnet-6efec823"] // 172.31.32.0/20 eu-west-2b
    }
  },
  overrides: {
    containerOverrides: [
      {
        command: commands
      }
    ]
  },
  taskDefinition
});
