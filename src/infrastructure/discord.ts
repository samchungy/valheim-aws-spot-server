import {config} from 'src/config';
import {logger} from 'src/logger';
import {axiosClient} from './axios';

const postMessage = async (message: string) => {
  try {
    await axiosClient.post(config.serverWebhook, {
      content: message,
    });
  } catch (err) {
    logger.error(
      {activity: 'postMessage', err},
      'Failed to post message to discord'
    );
  }
};

export {postMessage};
