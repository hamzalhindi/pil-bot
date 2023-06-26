const fs = require('node:fs');
const util = require('node:util');
const path = require('node:path');
const exec = util.promisify(require('node:child_process').exec);
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  path: __filename,

  data: new SlashCommandBuilder()
    .setName('randomnasheed')
    .setDescription('Responds with a random nasheed'),

  async execute(interaction) {
    await interaction.deferReply();

    const nasheedSource = getRandomNasheedSource();

    let dlUrl = '';
    let file = '';
    if (nasheedSource.hostname === 'archive.org') {
      [dlUrl, file] = await downloadFromArchive(nasheedSource);
    } else if (nasheedSource.hostname === 'www.youtube.com') {
      [dlUrl, file] = await downloadFromYt(nasheedSource);
    } else {
      return await interaction.followUp('ERROR: Unsupported nasheed source');
    }

    await interaction.followUp({ content: `<${dlUrl}>`, files: [file] });
    fs.unlinkSync(file);
  },
};

function getRandomNasheedSource() {
  const nasheedSources = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'resources', 'nasheed_sources.txt')).toString();
  const nasheedSourcesArray = nasheedSources.split('\n');
  const nasheedSource = new URL(nasheedSourcesArray[Math.floor(Math.random() * nasheedSourcesArray.length)]);
  return nasheedSource;
}

async function downloadFromArchive(url) {
  const identifier = url.pathname.split('/')[2];
  const metadata = (await exec(`ia metadata ${identifier}`)).stdout.trim();
  const fileArray = JSON.parse(metadata).files;

  const trueNasheedFiles = [];
  for (const file of fileArray) {
    const fileIsMedia = !(file.name.endsWith('.zip') || file.name.endsWith('.jpg') || file.name.endsWith('.png') || file.name.endsWith('.gif') || file.name.endsWith('.webp') || file.name.endsWith('.json') || file.name.endsWith('.description'));
    if (file.source === 'original' && file.format !== 'Metadata' && file.format !== 'Item Tile' && fileIsMedia) {
      trueNasheedFiles.push(file.name);
    }
  }

  const randomFile = trueNasheedFiles[Math.floor(Math.random() * trueNasheedFiles.length)];
  const dlUrl = `https://archive.org/download/${identifier}/${encodeURIComponent(randomFile)}`;

  const filename = (await exec(`yt-dlp "${dlUrl}" --cookies-from-browser firefox -x --audio-format mp3 -o ${Date.now()}.%(ext)s --print after_move:filepath`)).stdout.trim();
  return [dlUrl, filename];
}

async function downloadFromYt(url) {
  const vidList = (await exec(`yt-dlp "${url.toString()}" --cookies-from-browser firefox --flat-playlist --print urls`)).stdout.trim().split('\n');
  const dlUrl = vidList[Math.floor(Math.random() * vidList.length)];
  const filename = (await exec(`yt-dlp "${dlUrl}" --cookies-from-browser firefox -x --audio-format mp3 -o ${Date.now()}.%(ext)s --print after_move:filepath`)).stdout.trim();
  return [dlUrl, filename];
}