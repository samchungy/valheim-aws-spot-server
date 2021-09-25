interface Config {
  bucket: string;
  region: string;
  discordPublicToken: string;
  instanceType: string;
  instanceIamRole: string;
  securityGroup: string;
  elasticIp: string;
  elasticIpAllocationId: string;
  amazonLinuxAmi: string;
  serverName: string;
  serverPassword: string;
  serverWebhook: string;
  startServerName: string;
  stopServerName: string;
}

const env = (string: string) => process.env?.[string];

const config: Config = {
  bucket: env('BUCKET') || '',
  region: env('REGION') || '',
  discordPublicToken: env('DISCORD_PUBLIC_TOKEN') || '',
  instanceType: env('INSTANCE_TYPE') || '',
  instanceIamRole: env('INSTANCE_IAM_ROLE') || '',
  securityGroup: env('SECURITY_GROUP') || '',
  elasticIp: env('ELASTIC_IP') || '',
  elasticIpAllocationId: env('ELASTIC_IP_ALLOCATION_ID') || '',
  amazonLinuxAmi: 'ami-0210560cedcb09f07',
  serverName: env('SERVER_NAME') || '',
  serverPassword: env('SERVER_PASSWORD') || '',
  serverWebhook: env('SERVER_WEBHOOK') || '',
  startServerName: `${env('PREFIX')}-start-server`,
  stopServerName: `${env('PREFIX')}-stop-server`,
};

export {config, Config};
