# Felicity Bot

This bot is being made as a generalist bot for Discord, so expect some cool features in the future.

## Languages?

Mainly TypeScript

## How do I run it?

First you need Node.js version 16.6 or higher.\
If you use NVM to manage your versions you need to type these commands:\
`nvm install 16`\
`nvm use 16`\
then type:\
`yarn`\
At this stage you already have your dependecies and the correct Node version, but you need to set your Bot Token at `.env.example` and remove the `.example`

Now everything is set. Just type `yarn local` and your bot will be Online and working.

## Music

**If you want to play music you will need a google API key, place it in .env.example**

## Which commands can it run?

Currently it can \
`!ban <@user> || @everyone` \
`!kick <@user> || @everyone` \
`!unban <user id> || @everyone` \
`!prefix <prefix>`\
Music related commands:\
`!play <search>`\
`!next`\
`!stop`\
`!pause`

**EXPECT BUGS WITH THE MUSIC PLAYER**
