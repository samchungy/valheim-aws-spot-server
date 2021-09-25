import 'src/util/buffer-replace';
import {createServer} from './create-server';
import {updateDockerComposeFile} from './update-docker-compose';

const startServer = async () => {
  await Promise.all([updateDockerComposeFile(), createServer()]);
};

export {startServer};
