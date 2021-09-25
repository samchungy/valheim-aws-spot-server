import {APIGatewayEvent} from 'aws-lambda';
import {sign} from 'tweetnacl';
import {config} from 'src/config';

const authenticateDiscordCall = (event: APIGatewayEvent) => {
  const signature = event.headers['x-signature-ed25519'];
  const timestamp = event.headers['x-signature-timestamp'];
  const body = event.body;

  if (!signature || !timestamp || !body) {
    return false;
  }

  return sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, 'hex'),
    Buffer.from(config.discordPublicToken, 'hex')
  );
};

export {authenticateDiscordCall};
