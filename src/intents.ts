import { GatewayIntentBits } from 'discord.js';

// All events are listed here, if you want to remove something, just comment the flag.
const intents = [
  // GatewayIntentBits.DirectMessageReactions,
  // GatewayIntentBits.DirectMessageTyping,
  // GatewayIntentBits.DirectMessages,
  GatewayIntentBits.GuildBans,
  GatewayIntentBits.GuildEmojisAndStickers,
  // GatewayIntentBits.GuildIntegrations,
  // GatewayIntentBits.GuildInvites,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildMessageReactions,
  // GatewayIntentBits.GuildMessageTyping,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildPresences,
  GatewayIntentBits.GuildScheduledEvents,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildWebhooks,
  GatewayIntentBits.Guilds,
  GatewayIntentBits.MessageContent,
];

export default intents;
