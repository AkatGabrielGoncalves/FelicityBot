import { Message } from 'discord.js';
import IExecuteParameters from './IExecuteParameters';
import IPermissions from './IPermissions';

export default interface ICommand {
  type: string;
  command: string;
  alias: string[];
  description: string;
  usage: string[];
  botPermissions: IPermissions;
  userPermissions: IPermissions;
  execute: (parameters: IExecuteParameters) => Promise<void | Message | null>;
}
