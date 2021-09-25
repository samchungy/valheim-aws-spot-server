import {logger} from 'src/logger';
import {config} from 'src/config';
import {readFile} from 'fs/promises';
import {bufferReplace} from 'src/util/buffer-replace';

declare global {
  interface Buffer {
    replace(search: string, replace: string): Buffer;
  }
}
Buffer.prototype.replace = function (search: string, replace: string) {
  return bufferReplace(this, search, replace);
};

const getLaunchTemplate = async (): Promise<Buffer> => {
  try {
    const fileBuffer = await readFile(
      __dirname + '/launch-template-user-data.sh'
    );
    return fileBuffer.replace('VALHEIM_SERVER_BUCKET', config.bucket);
  } catch (err) {
    logger.error({err}, 'Failed to update launch template file');
    throw err;
  }
};

export {getLaunchTemplate};
