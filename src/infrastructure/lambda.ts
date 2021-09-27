import {InvokeCommand, LambdaClient} from '@aws-sdk/client-lambda';
import {StringMap} from 'aws-lambda/trigger/cognito-user-pool-trigger/_common';
import {config} from 'src/config';
import {logger} from 'src/logger';

const lambdaClient = new LambdaClient({region: config.region});

const invoke = async (
  functionName: string,
  payload?: Record<string, unknown>
) => {
  try {
    return await lambdaClient.send(
      new InvokeCommand({
        FunctionName: functionName,
        InvocationType: 'Event',
        Payload: payload && Buffer.from(JSON.stringify(payload), 'utf8'),
      })
    );
  } catch (err) {
    logger.error({err, functionName}, 'Failed to invoke function');
    throw err;
  }
};

export {lambdaClient, invoke};
