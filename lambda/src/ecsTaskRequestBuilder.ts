
type Convert = 'openpose-video-processor-dev-conversion-mp4-to-avi-ecs-task';
type Process = 'openpose-video-processor-dev-processing-ecs-task';

export const CONVERT_TASK: Convert = 'openpose-video-processor-dev-conversion-mp4-to-avi-ecs-task';
export const PROCESS_TASK: Process = 'openpose-video-processor-dev-processing-ecs-task';

// https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_RunTask.html#API_RunTask_RequestParameters
export const buildEcsRunTaskRequest = (
  taskDefinition: Convert | Process,
  commands: string[]
) => ({
  cluster: "string", // ARN
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
