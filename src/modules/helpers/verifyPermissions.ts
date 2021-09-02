import { Client, Message, PermissionResolvable } from 'discord.js';
import { retrieveUserAndAuthor } from './retrieveUserAndAuthor';

export const verifyPermissions =
  (commandFunction: Function, permissions: PermissionResolvable[]) =>
  async (client: Client, message: Message, args: { [key: string]: string }) => {
    const { authorMember } = await retrieveUserAndAuthor(message);

    try {
      const hasPermission = permissions.find((perm) => {
        if (authorMember?.permissions.has(perm)) {
          return true;
        }
        return false;
      });
      if (!hasPermission) throw new Error(`No permission`);
    } catch (err) {
      return await message.reply('Você não pode fazer isso!');
    }

    return commandFunction(client, message, args);
  };
