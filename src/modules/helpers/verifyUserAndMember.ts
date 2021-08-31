import { Message } from 'discord.js';

// This function will catch our user and member from the first mention of the message
export const verifyUserAndMember = async (message: Message) => {
  const user = message.mentions.users.first();
  let member = null;
  if (user) {
    member = message.guild?.members.resolve(user);
  }

  const { author } = message;

  const authorMember = message.guild?.members.resolve(author);

  return {
    user,
    member,
    author,
    authorMember,
  };
};
