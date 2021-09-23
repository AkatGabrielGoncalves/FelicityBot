# Felicity Bot

This bot is being made as a generalist bot for Discord, so expect some cool features in the future.

## Languages?

Mainly TypeScript

## How do I run it?

**Use node 14.x LTS**\
Even though discord.js v13 is not supposed to be compatible with node 14.x I made some changes to be compatible. This fixes the problem with ytdl-core which breaks the connection while streaming audio.

type `yarn --ignore-engines` this is necessary to bypass discord.js engine restriction.

At this stage you already have your dependecies and the correct Node version, but you need to set your Bot Token at `.env.example` and remove the `.example`

Now everything is set. Just type `yarn local` and your bot will be Online and working.

## SQL database

To use a SQL database you need to set your connection details inside the .env file and change USESQLDB to TRUE, the app will try to create the database, but you can create beforehand.

**Information inside the db.json will NOT be transferred to the Database**

## Music

**To play age restricted videos is necessary to get youtube authentication cookies**

## Which commands can it run?

Currently it can \
`!ban <@user> || @everyone` \
`!kick <@user> || @everyone` \
`!unban <user id> || @everyone` \
`!prefix <prefix>`\
`!channel` to lock itself into a channel, `!channel default` to listen to all channels, this command works regardless of the channel.

Music related commands:\
`!play <search> || <youtube url>` or `!p <search> || <youtube url>`\
`!next`\
`!stop`\
`!pause`\
`!queue`\
`!remove <number in queue>`

**EXPECT BUGS WITH THE MUSIC PLAYER**
