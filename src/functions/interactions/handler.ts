import {APIGatewayProxyHandler} from 'aws-lambda';
import {authenticateDiscordCall} from 'src/lib/discord-auth';
import {logger} from 'src/logger';
import {
  APIChatInputApplicationCommandGuildInteraction,
  APIPingInteraction,
  InteractionResponseType,
  InteractionType,
} from 'discord-api-types/payloads/v9';
import {applicationCommand} from './application-command';

const handler: APIGatewayProxyHandler = async (event, context) => {
  logger.withRequest(event, context);
  const isAuthenticated = authenticateDiscordCall(event);
  if (!isAuthenticated) {
    return {
      statusCode: 401,
      body: JSON.stringify({type: 1, data: 'invalid request signature'}),
    };
  }

  try {
    const body = JSON.parse(event.body as string) as
      | APIPingInteraction
      | APIChatInputApplicationCommandGuildInteraction;

    switch (body.type) {
      case InteractionType.Ping:
        return {
          statusCode: 200,
          body: JSON.stringify({type: InteractionType.Ping, data: 'OK'}),
        };
      case InteractionType.ApplicationCommand:
        const content = await applicationCommand(body.data);
        return {
          statusCode: 200,
          body: JSON.stringify({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
              content,
            },
          }),
        };
      default:
        return {
          statusCode: 200,
          body: JSON.stringify({type: InteractionType.MessageComponent}),
        };
    }
  } catch (err) {
    logger.error({err}, 'Failed to start server');
    return {
      statusCode: 200,
      body: JSON.stringify({type: 1, data: 'OK'}),
    };
  }
};

export {handler};
