const spawn = require(`child_process`).spawn;
const rtmpConfig = require(`../../config/rtmpConfig.js`);
const config = require(`../../config/config.js`);
const cmd = rtmpConfig.fission.ffmpeg;

module.exports = async (streamkey) => {
    const args = [
        `-y`,
        `-i`, `http://localhost:${config.ports.nmsHTTP}/live/${streamkey}/index.m3u8`,
        `-ss`, `00:00:01`,
        `-vframes`, `1`,
        `-vf`, `scale=-2:300`,
        `media/${streamkey}.png`
    ];

    spawn(cmd, args, {
        detached: true,
        stdio: `ignore`
    }).unref();
};
