const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  path: __filename,

  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reloads a bot command')
    .addStringOption(command => command
      .setName('command')
      .setDescription('The command to reload')
      .setRequired(true)),

  async execute(interaction) {
    const commandName = interaction.options.getString('command', true).toLowerCase();
    const command = interaction.client.commands.get(commandName);

    if (!command) {
      return interaction.reply(`There is no command with name \`${commandName}\`!`);
    }

    delete require.cache[require.resolve(command.path)];

    try {
      interaction.client.commands.delete(command.data.name);
      const newCommand = require(command.path);
      interaction.client.commands.set(newCommand.data.name, newCommand);
      await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
    } catch (err) {
      console.error(err);
      await interaction.reply(`There was an error while reloading a command \`${command.data.name}\`:\n\`${err.message}\``);
    }
  },
};