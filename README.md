# PIL Bot

##  Installation
0. Download and install the LTS version of [Node.js](https://nodejs.org/en)
1. Clone or download the repository
2. Ensure [yt-dlp](https://github.com/yt-dlp/yt-dlp), [ffmpeg](https://ffmpeg.org/), and [ia](https://archive.org/developers/internetarchive/installation.html) are all installed and in your PATH
3. Run `npm i` in the project directory to install all project dependencies
4. Create your `.env` file
### Creating a .env file
The .env file should be created at the root of the project directory and follow this format:
```
DISCORD_TOKEN=<Your Discord bot token>
CLIENT_ID=<Your Disocrd bot client ID>
TESTING_SERVER=<The Guild ID of a server you want to deploy testing commands to>
```
## Usage
1. Run `npm run deploy` to register slash commands
2. Run `node .` to start the bot

## Contributing
The command handler is set up to in such a way that every command file should belong in a subfolder under `src/commands` or `src/testing`

Commands in `src/commands` are globally made available in every server the bot is in, while commands in `src/testing` are only made available for the testing guild specified in the `.env` file.

Whenever a new command is created, you must rereun `npm run deploy` and restart the bot. If you are editing an existing command, you can use the `/reload` command on the testing server to re-import the latest version of the specified command.

All contributions should follow the existing ESLint rules.