import { Message } from 'discord.js';

// This function will catch our user from the first mention of the message and the author of the message
export const getUserAndAuthor = async (message: Message) => {
  const authorUser = message.author;

  const authorMember = message.member;

  return {
    authorUser,
    authorMember,
  };
};
