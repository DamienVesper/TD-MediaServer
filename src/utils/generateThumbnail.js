const spawn = require(`child_process`).spawn;
const config = require(`../../config/config.js`);
const log = require(`./log.js`);
const cmd = `/usr/bin/ffmpeg`;
const axios = require(`axios`);

module.exports = async (streamkey) => {

    setInterval(() => {
        const getStreamData = await axios.get(`http://localhost:${config.ports.nmsHTTP}/api/streams/live/${getStreamKey.data.streamkey}`);

        if (getStreamData.data.isLive == false) return clearInterval()

        log(`magenta`, `Generating Stream Thumbnail For: ${streamkey}`);
        const args = [
            `-y`,
            `-i`, `http://localhost:${config.ports.nmsHTTP}/live/${streamkey}.flv`,
            `-ss`, `00:00:01`,
            `-vframes`, `1`,
            `-vf`, `scale=-2:300`,
            `media/${streamkey}.png`
        ];

        spawn(cmd, args, {
            detached: true,
            stdio: `ignore`
        }).unref();
    }, 60000)

    
};
