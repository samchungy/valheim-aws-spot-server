import {
  DescribeSpotInstanceRequestsCommand,
  TerminateInstancesCommand,
} from '@aws-sdk/client-ec2';
import {
  SendCommandCommand,
  waitUntilCommandExecuted,
} from '@aws-sdk/client-ssm';
import {config} from 'src/config';
import {postMessage} from 'src/infrastructure/discord';
import {ec2Client} from 'src/infrastructure/ec2Client';
import {ssmClient} from 'src/infrastructure/ssmClient';
import {logger} from 'src/logger';

const getInstance = async (): Promise<string | undefined> => {
  try {
    const describeInstanceCommand = new DescribeSpotInstanceRequestsCommand({
      Filters: [
        {
          Name: 'state',
          Values: ['open', 'active'],
        },
        {
          Name: 'tag:type',
          Values: ['Valheim Server'],
        },
      ],
    });
    const instanceResult = await ec2Client.send(describeInstanceCommand);
    return instanceResult?.SpotInstanceRequests?.[0].InstanceId;
  } catch (err) {
    logger.error({err, activity: 'getSpotInstance'});
    throw err;
  }
};

const sendShutdownBackupCommands = async (instanceId: string) => {
  try {
    const results = await ssmClient.send(
      new SendCommandCommand({
        InstanceIds: [instanceId],
        DocumentName: 'AWS-RunShellScript',
        Comment: 'Runs shutdown commands',
        Parameters: {
          commands: [
            `docker stop $(docker ps -q)`,
            `cd /home/ec2-user`,
            `aws s3 cp ./valheim/saves s3://${config.bucket}/valheim/saves --recursive`,
            `aws s3 cp ./valheim/backups s3://${config.bucket}/valheim/backups --recursive`,
          ],
        },
      })
    );

    await waitUntilCommandExecuted(
      {client: ssmClient, maxWaitTime: 30},
      {
        CommandId: results.Command?.CommandId,
        InstanceId: instanceId,
      }
    );
  } catch (err) {
    logger.error(
      {err, activity: 'sendShutdownBackupCommand'},
      'Failed to send shutdown backup commands'
    );
    throw err;
  }
};

const terminateInstance = async (instanceId: string) => {
  try {
    await ec2Client.send(
      new TerminateInstancesCommand({
        InstanceIds: [instanceId],
      })
    );
  } catch (err) {
    logger.error({err}, 'Failed to terminate instance');
    throw err;
  }
};

const stopServer = async () => {
  const instanceId = await getInstance();
  if (!instanceId) {
    await postMessage('Server is already stopped');
    return;
  }

  await sendShutdownBackupCommands(instanceId);

  await terminateInstance(instanceId);

  await postMessage('Server instance terminated');
};

export {stopServer};
