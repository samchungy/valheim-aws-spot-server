import {logger} from 'src/logger';
import {config} from 'src/config';
import {readFile} from 'fs/promises';
import {s3Client} from 'src/infrastructure/s3Client';
import {PutObjectCommand} from '@aws-sdk/client-s3';
import {bufferReplace} from 'src/util/buffer-replace';

declare global {
  interface Buffer {
    replace(search: string, replace: string): Buffer;
  }
}
Buffer.prototype.replace = function (search: string, replace: string) {
  return bufferReplace(this, search, replace);
};

const updateDockerComposeFile = async () => {
  try {
    const fileBuffer = await readFile(__dirname + '/docker-compose.yml');
    const updatedFileBuffer = fileBuffer
      .replace('VALHEIM_SERVER_NAME', config.serverName)
      .replace('VALHEIM_SERVER_PASSWORD', config.serverPassword)
      .replace('VALHEIM_SERVER_WEBHOOK', config.serverWebhook);

    const uploadCommand = new PutObjectCommand({
      Bucket: config.bucket,
      Key: 'docker-compose.yml',
      Body: updatedFileBuffer,
    });

    await s3Client.send(uploadCommand);
  } catch (err) {
    logger.error({err}, 'Failed to update docker-compose file');
    throw err;
  }
};

export {updateDockerComposeFile};
