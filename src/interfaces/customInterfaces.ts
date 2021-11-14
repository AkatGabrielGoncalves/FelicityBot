import { Client, Message, PermissionResolvable } from 'discord.js';
import { Database } from '../database';

export interface ICommand {
  readonly type: string;
  readonly command: string;
  readonly alias: string[];
  readonly description: string;
  readonly usage: string[];
  readonly botPermissions: IPermissions;
  readonly userPermissions: IPermissions;
  readonly execute: (
    parameters: IExecuteParameters
  ) => Promise<void | Message | null>;
}

export interface IExecuteParameters {
  readonly client: ICustomClient;
  readonly message: Message;
  readonly args: string[];
}

export interface IPermissions {
  readonly atLeastOne: PermissionResolvable[];
  readonly mustHave: PermissionResolvable[];
}
export interface ICustomClient extends Client {
  readonly commandsMap: {
    commandsHandlersMap: Map<String, ICommand[]>;
    commandMap: Map<String, { handler: ICommand; execute: Function }>;
  };
  readonly db: Database | null;
}
