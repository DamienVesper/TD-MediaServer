const spawn = require(`child_process`).spawn;
const rtmpConfig = require(`../../config/rtmpConfig.js`);
const config = require(`../../config/config.js`);
const log = require(`./log.js`);
const cmd = rtmpConfig.fission.ffmpeg;

module.exports = async (streamkey) => {
    log(`magenta`, `Generating Stream Thumbnail For: ${streamkey}`);
    const args = [
        `-y`,
        `-i`, `http://localhost:${config.ports.nmsHTTP}/live/${streamkey}.flv`,
        `-ss`, `00:00:01`,
        `-vframes`, `1`,
        `-vf`, `scale=-2:300`,
        `media/snapshot_${streamkey}.png`
    ];

    spawn(cmd, args, {
        detached: true,
        stdio: `ignore`
    }).unref();
};
