const fs = require('node:fs');
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const { SlashCommandBuilder } = require('discord.js');

const MAX_FILESIZE = 25 * Math.pow(1024, 2);

module.exports = {
  path: __filename,

  data: new SlashCommandBuilder()
    .setName('randomnasheed')
    .setDescription('Responds with a random nasheed'),

  async execute(interaction) {
    await interaction.deferReply();
    let filename = '';
    let dlUrl = '';

    while (filename === '' || fs.statSync(filename) > MAX_FILESIZE) {
      // Delete any too large files that were left over from the previous search
      if (filename !== '') {
        fs.unlink(filename);
      }

      const { stdout } = await exec('ia search "(نشيد OR nasheed NOT isis NOT ajnad NOT سورة) AND (mediatype:audio OR mediatype:movies) -creator:(tariq elite nasheed*)"');
      const searchResponse = stdout.trim().split('\n');
      const selection = searchResponse[Math.floor(Math.random() * searchResponse.length)];
      const identifier = JSON.parse(selection).identifier;

      const metadata = (await exec(`ia metadata ${identifier}`)).stdout.trim();
      const fileArray = JSON.parse(metadata).files;
      const trueNasheedFiles = [];
      for (const file of fileArray) {
        const fileIsMedia = !(file.name.endsWith('.zip') || file.name.endsWith('.jpg') || file.name.endsWith('.png') || file.name.endsWith('.gif') || file.name.endsWith('.webp') || file.name.endsWith('.json') || file.name.endsWith('.description'));
        if (file.source === 'original' && file.format !== 'Metadata' && file.format !== 'Item Tile' && fileIsMedia) {
          trueNasheedFiles.push(file.name);
        }
      }

      if (trueNasheedFiles.length === 0) continue;

      const randomFile = trueNasheedFiles[Math.floor(Math.random() * trueNasheedFiles.length)];
      dlUrl = `https://archive.org/download/${identifier}/${encodeURIComponent(randomFile)}`;

      filename = (await exec(`yt-dlp "${dlUrl}" --cookies-from-browser firefox -x --audio-format mp3 -o ${Date.now()}.%(ext)s --print after_move:filepath`)).stdout.trim();
    }

    await interaction.followUp({ content: `<${dlUrl}>`, files: [filename] });
    fs.unlinkSync(filename);
  },
};