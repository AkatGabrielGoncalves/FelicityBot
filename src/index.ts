import Discord from 'discord.js';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import intents from './intents';
import { commandsHandler } from './modules/commandsHandler';

// This will load our BOT_TOKEN from the .env file so we can access at process.env
dotenv.config();

const mongoString = process.env.MONGO_CONNECTION_STRING || '';

/* intents are all the events that this bot will listen,
 which is everything. You can change this behavior at ./intents.ts */
const client = new Discord.Client({ intents });

// This is our listener that captures all messages sent
client.on('messageCreate', (message) => commandsHandler(client, message));

// Well, this creates a connection to our bot
mongoose.connect(mongoString).then(() => console.log('Connected to DB'));
client
  .login(process.env.BOT_TOKEN)
  .then(() => console.log('Bot is online'))
  .catch((err) => {
    console.log(`Bot failed to start ${err}`);
  });
