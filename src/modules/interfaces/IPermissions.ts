import { PermissionResolvable } from 'discord.js';

export default interface IPermissions {
  atLeastOne: PermissionResolvable[];
  mustHave: PermissionResolvable[];
}
