import {logger} from 'src/logger';
import {ec2Client} from 'src/infrastructure/ec2Client';
import {
  AssociateAddressCommand,
  DescribeInstancesCommand,
  DescribeSpotInstanceRequestsCommand,
  RequestSpotInstancesCommand,
  SpotInstanceRequest,
  waitUntilSpotInstanceRequestFulfilled,
} from '@aws-sdk/client-ec2';
import {config} from 'src/config';
import {getLaunchTemplate} from './get-launch-template';
import {postMessage} from 'src/infrastructure/discord';

const queryIsServerRunning = async (): Promise<boolean> => {
  logger.info(
    {activity: 'checkIsServerRunning'},
    'Checking if server is already running'
  );
  try {
    const query = await ec2Client.send(
      new DescribeInstancesCommand({
        Filters: [
          {Name: 'instance.group-id', Values: [config.securityGroup]},
          {Name: 'instance-state-name', Values: ['pending', 'running']},
        ],
      })
    );

    if (query.Reservations?.[0]?.Instances?.[0]) {
      return true;
    }

    return false;
  } catch (err) {
    logger.error(
      {activity: 'checkIsServerRunning', err},
      'Checking for server state failed'
    );
    throw err;
  }
};

const requestSpotInstance = async (userData: Buffer) => {
  logger.info(
    {activity: 'requestSpotInstance'},
    'Sending spot instance request'
  );

  try {
    const request = new RequestSpotInstancesCommand({
      LaunchSpecification: {
        UserData: userData.toString('base64'),
        IamInstanceProfile: {
          Arn: config.instanceIamRole,
        },
        InstanceType: config.instanceType,
        SecurityGroupIds: [config.securityGroup],
        ImageId: config.amazonLinuxAmi,
      },
      TagSpecifications: [
        {
          Tags: [{Key: 'type', Value: 'Valheim Server'}],
          ResourceType: 'spot-instances-request',
        },
      ],
    });
    const response = await ec2Client.send(request);
    return (response.SpotInstanceRequests as SpotInstanceRequest[]).map(
      req => req.SpotInstanceRequestId as string
    );
  } catch (err) {
    logger.error(
      {err, activity: 'requestSpotInstance'},
      'Sending spot instance request failed'
    );
    throw err;
  }
};

const waitForSpotInstance = async (requestIds: string[]): Promise<string> => {
  logger.info(
    {activity: 'waitForSpotInstance', requestIds},
    'Waiting for spot instance request fulfillment'
  );

  try {
    await waitUntilSpotInstanceRequestFulfilled(
      {
        client: ec2Client,
        maxWaitTime: 100,
      },
      {
        SpotInstanceRequestIds: requestIds,
      }
    );

    logger.info(
      {requestIds, activity: 'waitForSpotInstance'},
      'Spot instance request fulfilled'
    );

    const describeInstanceCommand = new DescribeSpotInstanceRequestsCommand({
      SpotInstanceRequestIds: requestIds,
    });
    const instanceResult = await ec2Client.send(describeInstanceCommand);
    return instanceResult.SpotInstanceRequests?.[0].InstanceId as string;
  } catch (err) {
    logger.error(
      {err, activity: 'waitForSpotInstance'},
      'Waiting for spot instance request failed'
    );
    throw err;
  }
};

const allocateElasticIp = async (instanceId: string) => {
  logger.info({activity: 'allocateElasticIp'}, 'Allocating elastic IP address');
  const associateCommand = new AssociateAddressCommand({
    AllocationId: config.elasticIpAllocationId,
    InstanceId: instanceId,
  });

  try {
    await ec2Client.send(associateCommand);
  } catch (err) {
    logger.error(
      {err, activity: 'allocateElasticIp'},
      'Allocating elastic IP address failed'
    );
    throw err;
  }
};

const getPublicIPAddress = async (instanceId: string): Promise<string> => {
  logger.info({activity: 'getPublicIPAddress'}, 'Getting public IP address');
  try {
    const command = new DescribeInstancesCommand({InstanceIds: [instanceId]});
    const instance = await ec2Client.send(command);
    return instance.Reservations?.[0].Instances?.[0].PublicIpAddress as string;
  } catch (err) {
    logger.error(
      {activity: 'getPublicIPAddress', err},
      'Failed to get public IP address'
    );
    throw err;
  }
};

const createServer = async () => {
  const [isServerRunning, userDataBuffer] = await Promise.all([
    queryIsServerRunning(),
    getLaunchTemplate(),
  ]);

  if (isServerRunning) {
    await postMessage('Server is already running');
    return;
  }

  const spotInstanceRequestIds = await requestSpotInstance(userDataBuffer);
  const instanceId = await waitForSpotInstance(spotInstanceRequestIds);

  let ipAddress: string;
  if (config.elasticIpAllocationId) {
    await allocateElasticIp(instanceId);
    ipAddress = config.elasticIp;
  } else {
    ipAddress = await getPublicIPAddress(instanceId);
  }

  await postMessage(
    `${config.serverName} is booting up. Server IP: \`${ipAddress}:2456\``
  );
};

export {createServer};
