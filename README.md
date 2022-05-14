# Felicity Bot

This bot is being made as a generalist bot for Discord. But it mainly plays music from youtube and can understand spotify playlists. Made it for fun. Not commercial use.

## **If you have an idea or a problem, open an issue! Or you can reach out to me on discord: ライケン#6249**

---

# How do I run it?

**Node 16.x LTS REQUIRED**

- Install dependencies. ( [yarn](https://yarnpkg.com/getting-started/install) required )

```
yarn
```

- Get your Discord Bot Token from [Discord Developers](https://discord.com/developers/)

![](/assets/images/bottoken.png)

- Recommended to activate all intents here:

![](/assets/images/intents.png)

- Then you are going to set you bot token inside a .env file just like the .env.example

```
# Copy your bot token here and remove the .example from this archive! =)
BOT_TOKEN=

#YOUTUBE LOGIN COOKIE
YOUTUBE_LOGIN_COOKIE=

#DISABLE YTDL UPDATE CHECK
YTDL_NO_UPDATE=FALSE

#DATABASE CONFIG
DB_HOST=localhost
DB_PORT=3306
DB_NAME=
DB_USERNAME=root
DB_PASSWORD=
DB_DIALECT=
#one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' // anything that works with sequelize
DB_LOGGING=FALSE #Leave it this way

#DISCORD WEBHOOK URI FOR LOGGING IN A CHANNEL
DISCORD_WEBHOOK_URI_USE=FALSE
DISCORD_WEBHOOK_URI=
DISCORD_WEBHOOK_USER_ID=

#TURN ON DEBUG? // TRUE TO USE IT, FALSE OR ANYTHING ELSE TO NOT USE
DEBUG_MODE=FALSE

#SPOTIFY CLIENT
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
```

- Now you can use this command to start your bot locally:

```
yarn local
```

# How to build this project

- To build this project you need to write this command:

```
yarn build
```

- The build will be at avaiable at ./dist/ then you can use to deploy your application. Just remember to set your enviroment variables when you deploy.

- **Obs: The db.json inside /src/database/ will not be copied over to the dist folder, you need to do it manually**

---

# Using a Relational Database

- To setup your database you need to fill these fields inside your .env file:

```
#DATABASE CONFIG
DB_HOST=localhost
DB_PORT=3306
DB_NAME=
DB_USERNAME=root
DB_PASSWORD=
DB_DIALECT=
#one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' // anything that works with sequelize
DB_LOGGING=FALSE #Leave it this way
```

- The app will handle the creation of the database, if the user you are going to use don't have permissions to create a database, create it before hand.


---

# How do I add/remove commands?

- To create commands and remove them is simple. All commands are stored inside the 'commands' folder for each category, like 'admin' or 'music'. Inside all modules folders you will find an 'index.js' file like this:

```ts
import ICommand from '../interfaces/ICommand';
import handleBan from './commands/ban';
import handleKick from './commands/kick';
import handleUnban from './commands/unban';

export const adminCommandHandlers: ICommand[] = [handleBan, handleKick, handleUnban];
```

- So, if you want to remove a command you could just remove its handler:

```ts
export const adminCommandHandlers: ICommand[] = [handleKick, handleUnban];
```

- **The 'adminCommandHandlers' is used to map all commands and their aliases, so all commands that you want to use from the 'admins' module must be inside this array.**

- To add a command you need to use this 'blank' schema:

```ts
import { MessageEmbed } from 'discord.js';
import ICommand from '../../interfaces/ICommand';
import IExecuteParameters from '../../interfaces/IExecuteParameters';
import IPermissions from '../../interfaces/IPermissions';

class HandleHelp implements ICommand {
  // CHANGE CLASS NAME TO MATCH YOUR COMMAND
  type: string;
  command: string;
  alias: string[];
  description: string;
  usage: string[];
  botPermissions: IPermissions;
  userPermissions: IPermissions;

  constructor() {
    this.type = 'Misc'; // COMMAND TYPE
    this.command = 'help'; // COMMAND
    this.alias = []; // ALIASES LIKE ['h','ajuda']
    this.description = `This is a help command`; // BRIEF DESCRIPTION
    this.usage = ['help', 'help play']; // EXAMPLES OF USAGE
    this.botPermissions = {
      // HERE YOU NEED TO WRITE THE PERMISSIONS THAT YOUR BOT NEEDS TO HAVE TO EXECUTE THIS COMMAND

      atLeastOne: [], // BOT MUST HAVE AT LEAST ONE PERMISSION FROM THIS ARRAY

      mustHave: [], // BOT MUST HAVE ALL PERMISSIONS LISTED HERE
    };
    this.userPermissions = {
      // HERE YOU NEED TO WRITE THE PERMISSIONS THAT THE USER WHO USED THE COMMAND NEEDS TO HAVE
      atLeastOne: [], // USER MUST HAVE AT LEAST ONE PERMISSION FROM THIS ARRAY
      mustHave: [], // USER MUST HAVE ALL PERMISSIONS LISTED HERE
    };
  }

  execute = async ({ client, message, args }: IExecuteParameters) => {
    // WRITE YOUR LOGIC HERE
  };
}

export default new HandleHelp(); // CHANGE EXPORT TO MATCH YOUR COMMAND
```

- After you create your command inside one of the modules, or create your module, you need to add it to the index.ts inside its module like:

```ts
import ICommand from '../interfaces/ICommand';
import handleChannel from './commands/channel';
import handlePrefix from './commands/prefix';
import handleHelp from './commands/help'; // added import

export const miscCommandHandlers: ICommand[] = [
  handlePrefix,
  handleChannel,
  handleHelp, // added here
];
```

- This will correctly map the commands from the misc module.

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
`!remove <number in queue>`\
`!loop`

**EXPECT BUGS WITH THE MUSIC PLAYER**
