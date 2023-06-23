const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  path: __filename,

  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Gives the ping of the bot'),

  async execute(interaction) {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    interaction.editReply(`Ping: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
  },
};