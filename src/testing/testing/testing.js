const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  path: __filename,

  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('Provides a sample testing command'),

  async execute(interaction) {
    await interaction.reply('Testing command executed');
  },
};