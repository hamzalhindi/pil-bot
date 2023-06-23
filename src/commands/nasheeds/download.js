const fs = require('node:fs');
const path = require('node:path');
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const { SlashCommandBuilder } = require('discord.js');

const NO_EMBED_AUDIO_EXTS = ['.m4a', '.aac', '.opus'];
const NO_EMBED_VIDEO_EXTS = ['.mov', '.webm', '.flv', '.3gp', '.mkv', '.ogv'];

// 25 MB file limit for Discord
const MAX_SIZE = 25 * Math.pow(1024, 2);

module.exports = {
  path: __filename,

  data: new SlashCommandBuilder()
    .setName('download')
    .setDescription('Downloads a piece of media from the requested URL')
    .addStringOption(option => option
      .setName('url')
      .setDescription('The URL to download from')
      .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();

    const dlCmd = `yt-dlp "${interaction.options.getString('url')}" --cookies-from-browser firefox -S "filesize:20M" -o "${Date.now()}.%(ext)s" --print after_move:filepath`;
    const { stdout } = await exec(dlCmd);

    const fileName = stdout.trim();
    let secondFile = null;

    const fileExceedsSize = fs.statSync(fileName).size > MAX_SIZE;

    if (NO_EMBED_VIDEO_EXTS.includes(path.parse(fileName).ext) || fileExceedsSize) {
      secondFile = `${path.parse(fileName).name}-compressed.mp4`;
      if (fileExceedsSize) {
        // Right now we just half the resolution and lower the CRF
        // There needs to be a more accurate/smart way to do this
        await exec(`ffmpeg -i ${fileName} -c:v libx264 -vf "scale=iw/2:ih/2:force_original_aspect_ratio=decrease:force_divisible_by=2" -crf 24 ${secondFile}`);
      } else {
        await exec(`ffmpeg -i ${fileName} ${secondFile}`);
      }
    } else if (NO_EMBED_AUDIO_EXTS.includes(path.parse(fileName).ext)) {
      secondFile = `${path.parse(fileName).name}-compressed.mp3`;
      await exec(`ffmpeg -i ${fileName} ${secondFile}`);
    }

    await interaction.followUp({ files: [secondFile ?? fileName] });

    fs.unlinkSync(fileName);
    if (secondFile !== null) fs.unlinkSync(secondFile);
  },
};