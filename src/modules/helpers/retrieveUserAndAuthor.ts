import { Message } from 'discord.js';

// This function will catch our user from the first mention of the message and the author of the message
export const retrieveUserAndAuthor = async (message: Message) => {
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
