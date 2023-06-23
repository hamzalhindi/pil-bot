const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('node:fs');
const path = require('node:path');

dotenv.config();

loadCommandsFromFolder('commands', false);
loadCommandsFromFolder('testing', true);

function loadCommandsFromFolder(folderName, testing) {
  const commands = [];
  const foldersPath = path.join(__dirname, folderName);
  const commandsFolder = fs.readdirSync(foldersPath);

  for (const folder of commandsFolder) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
      } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }

  const rest = new REST().setToken(process.env.DISCORD_TOKEN);

  (async () => {
    try {
      if (testing) {
        console.log(`Started refreshing ${commands.length} application (/) commands for testing`);

        const data = await rest.put(
          Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.TESTING_SERVER),
          { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands for testing`);
      } else {
        console.log(`Started refreshing ${commands.length} application (/) commands`);

        const data = await rest.put(
          Routes.applicationCommands(process.env.CLIENT_ID),
          { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands`);
      }
    } catch (err) {
      console.error(err);
    }
  })();
}