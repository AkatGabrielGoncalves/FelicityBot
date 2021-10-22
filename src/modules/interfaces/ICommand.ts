import { Client, Message, PermissionResolvable } from 'discord.js';
import { Database } from '../../database';

export default interface ICommand {
  type: string;
  command: string;
  alias: string[];
  description: string;
  usage: string[];
  botPermissions: {
    atLeastOne: PermissionResolvable[];
    mustHave: PermissionResolvable[];
  };
  userPermissions: {
    atLeastOne: PermissionResolvable[];
    mustHave: PermissionResolvable[];
  };
  execute: (
    client: Client,
    message: Message,
    args: string[],
    db?: Database
  ) => Promise<void | Message | null>;
}
