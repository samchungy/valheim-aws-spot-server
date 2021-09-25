import {Handler} from 'aws-lambda';
import {postMessage} from 'src/infrastructure/discord';
import {logger} from 'src/logger';
import {startServer} from './usecases/start-server';

const handler: Handler = async (event, context) => {
  logger.withRequest(event, context);
  try {
    await startServer();
  } catch (err) {
    logger.error({err}, 'Failed to start server');
    await postMessage('Failed to start server');
    throw err;
  }
};

export {handler};
