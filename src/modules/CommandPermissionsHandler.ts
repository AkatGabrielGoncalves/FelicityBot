import { GuildMember, Message, PermissionResolvable } from 'discord.js';
import { ICommand, ICustomClient } from '../interfaces/customInterfaces';
import Logger from '../logger/Logger';
import { basicReply } from '../utils/basicReply';

export class CommandPermissionsHandler {
  protected readonly client: ICustomClient;

  private readonly responses: {
    botAtLeastOne: (permissions: PermissionResolvable[]) => string;
    botMissingPermissions: (permissions: PermissionResolvable[]) => string;
    userAtLeastOne: (permissions: PermissionResolvable[]) => string;
    userMissingPermissions: (permissions: PermissionResolvable[]) => string;
  };

  constructor(client: ICustomClient) {
    this.client = client;
    this.responses = {
      botAtLeastOne: (permissions: PermissionResolvable[]) =>
        `Eu não tenho pelo menos uma dessas permissões! ${permissions}`,
      botMissingPermissions: (permissions: PermissionResolvable[]) =>
        `Eu não tenho as seguintes permissões necessárias para executar esse comando: ${permissions}`,
      userAtLeastOne: (permissions: PermissionResolvable[]) =>
        `Você não tem pelo menos uma dessas permissões! ${permissions}`,
      userMissingPermissions: (permissions: PermissionResolvable[]) =>
        `Você não tem as seguintes permissões necessárias para executar esse comando: ${permissions}`,
    };
  }

  private readonly __getMembers = (message: Message): [GuildMember, GuildMember] => [
    message.guild?.members.cache.get(this.client.user?.id as string)!,
    message.member!,
  ];

  private readonly __checkAtLeastOnePermission = (
    member: GuildMember,
    atLeastOnePermissions: PermissionResolvable[]
  ) => {
    const memberHaveUniquePermission = atLeastOnePermissions.find((perm) =>
      member.permissions.has(perm)
    );

    if (!memberHaveUniquePermission && atLeastOnePermissions[0]) {
      return atLeastOnePermissions;
    }
    return false;
  };

  private readonly __checkMustHavePermission = (
    member: GuildMember,
    mustHavePermissions: PermissionResolvable[]
  ) => {
    const memberMissingPermissions = mustHavePermissions.filter(
      (perm) => !member.permissions.has(perm)
    );

    if (memberMissingPermissions[0]) {
      return memberMissingPermissions;
    }
    return false;
  };

  private readonly __checkBotPermissions = (
    message: Message,
    botMember: GuildMember,
    handler: ICommand
  ) => {
    let botNotAuthorized = this.__checkAtLeastOnePermission(
      botMember,
      handler.botPermissions.atLeastOne
    );

    if (botNotAuthorized)
      return this.__reply(message, this.responses.botAtLeastOne(botNotAuthorized));

    botNotAuthorized = this.__checkMustHavePermission(botMember, handler.botPermissions.mustHave);

    if (botNotAuthorized)
      return this.__reply(message, this.responses.botMissingPermissions(botNotAuthorized));

    return false;
  };

  private readonly __checkUserPermissions = (
    message: Message,
    userMember: GuildMember,
    handler: ICommand
  ) => {
    let userNotAuthorized = this.__checkAtLeastOnePermission(
      userMember,
      handler.userPermissions.atLeastOne
    );

    if (userNotAuthorized)
      return this.__reply(message, this.responses.userAtLeastOne(userNotAuthorized));

    userNotAuthorized = this.__checkMustHavePermission(
      userMember,
      handler.userPermissions.mustHave
    );

    if (userNotAuthorized)
      return this.__reply(message, this.responses.userMissingPermissions(userNotAuthorized));

    return false;
  };

  private readonly __reply = (message: Message, response: string) =>
    basicReply(message, response, 'info');

  protected readonly checkHandlerPermissions = (
    message: Message,
    args: string[],
    handler: ICommand
  ) => {
    Logger.log(
      'DEBUG',
      `${message.guildId}-${message.member?.id}:Checking permissions.`,
      new Error()
    );

    const [botMember, userMember] = this.__getMembers(message);

    const botNotAuthorized = this.__checkBotPermissions(message, botMember, handler);

    if (botNotAuthorized) return botNotAuthorized;

    const userNotAuthorized = this.__checkUserPermissions(message, userMember, handler);

    if (userNotAuthorized) return userNotAuthorized;

    Logger.log(
      'DEBUG',
      `${message.guildId}-${message.member?.id}:User and Bot has necessary permissions.`,
      new Error()
    );
    return handler.execute({ client: this.client, message, args });
  };
}
