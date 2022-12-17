// import { ApplicationCommandOption, ApplicationCommandOptionType } from 'discord.js';
// import { getUserAndAuthor } from '../../../utils/modules/commands/getUserAndAuthor';
// import { IPermissions, ICommand, IExecuteParameters } from '../../../interfaces/customInterfaces';
// import { basicReply } from '../../../utils/basicReply';

// class HandleKick implements ICommand {
//   type: string;

//   command: string;

//   alias: string[];

//   description: string;

//   usage: string[];

//   botPermissions: IPermissions;

//   userPermissions: IPermissions;

//   options: ApplicationCommandOption[];

//   constructor() {
//     this.type = 'Admin';
//     this.command = 'kick';
//     this.alias = [];
//     this.description = 'remove um usuário do servidor ou todos os usuários';
//     this.usage = ['kick @user', 'kick @everyone'];
//     this.options = [
//       {
//         name: 'user',
//         description: 'Usuario',
//         type: ApplicationCommandOptionType.Mentionable,
//         required: true,
//       },
//     ];
//     this.botPermissions = {
//       atLeastOne: ['Administrator', 'KickMembers'],
//       mustHave: ['SendMessages'],
//     };
//     this.userPermissions = {
//       atLeastOne: ['Administrator', 'KickMembers'],
//       mustHave: [],
//     };
//   }

//   execute = async ({ client, message, args }: IExecuteParameters) => {
//     if (!args[0]) return basicReply(message, '?', 'info');

//     const { mentionUser, mentionMember, authorUser } = await getUserAndAuthor(message);

//     if (!mentionUser || !mentionMember)
//       return basicReply(message, 'Por favor, um usuário válido, sim?', 'info');

//     if (mentionUser && (mentionUser.id === client.user?.id || mentionUser.id === authorUser.id))
//       return basicReply(message, 'Haha boa tentativa.', 'info');

//     if (message.mentions.everyone) {
//       // This is a map so I can take the array to assert my tests.
//       return Promise.all(
//         (await message.guild?.members.fetch()!).map(async (m) => {
//           try {
//             await m.kick();
//             return await message.channel.send(`Auf Wiedersehen, <@${m.id}>`);
//           } catch (err) {
//             return await message.reply(`Eu acho que... eu não consigo expulsar <@${m.id}>!`);
//           }
//         })
//       );
//     }

//     try {
//       await mentionMember.kick();
//       return basicReply(message, `Auf Wiedersehen, <@${mentionUser.id}>`, 'success');
//     } catch (err) {
//       return mentionUser
//         ? basicReply(
//             message,
//             `Eu acho que... eu não consigo expulsar <@${mentionUser.id}>!`,
//             'error'
//           )
//         : basicReply(message, `Esse usuário não existe!`, 'error');
//     }
//   };
// }

// export default new HandleKick();
