import {Handler} from 'aws-lambda';
import {postMessage} from 'src/infrastructure/discord';
import {logger} from 'src/logger';
import {stopServer} from './usecases/stop-server';

const handler: Handler = async (event, context) => {
  logger.withRequest(event, context);
  try {
    await stopServer();
  } catch (err) {
    logger.error({err}, 'Failed to stop server');
    await postMessage('Failed to stop server');
    throw err;
  }
};

export {handler};
