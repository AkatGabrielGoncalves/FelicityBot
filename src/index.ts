import Discord from 'discord.js';
import * as dotenv from 'dotenv';
import intents from './intents';

// This will load our BOT_TOKEN from the .env file so we can access at process.env
dotenv.config();

/* intents are all the events that this bot will listen,
 which is everything. You can change this behavior at ./intents.ts */
const client = new Discord.Client({ intents });

// Well, this creates a connection to our bot
client.login(process.env.BOT_TOKEN);
