import {APIChatInputApplicationCommandInteractionData} from 'discord-api-types/payloads/v9/interactions';
import {config} from 'src/config';
import {BaseCommand, ValheimCommand} from 'src/domain/commands';
import {invoke} from 'src/infrastructure/lambda';

type CommandMap = {
  [name in BaseCommand]: ValheimCommandMap;
};

type ValheimCommandMap = {
  [name in ValheimCommand]: () => Promise<unknown>;
};

const map: CommandMap = {
  valheim: {
    start: () => invoke(config.startServerName),
    stop: () => invoke(config.stopServerName),
  },
};

const applicationCommand = async (
  data: APIChatInputApplicationCommandInteractionData
) => {
  const baseCommand = data.name as BaseCommand;
  const subCommand = data?.options?.[0]?.name as ValheimCommand;
  const result = await map?.[baseCommand]?.[subCommand]?.();

  const commandType = result
    ? subCommand.charAt(0).toUpperCase() + subCommand.slice(1)
    : 'Invalid';

  return `${commandType} command received`;
};
export {applicationCommand};
