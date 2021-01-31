const NodeMediaServer = require(`node-media-server`);
const log = require(`./utils/log.js`);
const axios = require(`axios`);

const config = require(`../config/config.js`);
const rtmpConfig = require(`../config/rtmpConfig.js`);

const server = new NodeMediaServer(rtmpConfig);

// Log errors in a different color.
process.on(`uncaughtException`, err => log(`red`, err.stack));

const nms = new NodeMediaServer(config);
nms.run();
nms.on(`prePublish`, async (id, StreamPath, args) => {
    const streamKey = getStreamKeyFromStreamPath(StreamPath);
    console.log(`[NodeEvent on prePublish]`, `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    await axios.get(`https://throwdown.tv/api/streamkey/${streamKey}`)
        .then(async (response) => {
            // Check if it works
            if (!response.data.canstream) {
                const session = nms.getSession(id);
                session.reject();
                console.log(`Stream key does not exist ${streamKey}`);
            } else {
                console.log(`Stream key does exist ${streamKey}`);
                await axios.get(`https://throwdown.tv/api/send_notification_email/${process.env.NOTIFICATION_API_KEY}/${response.data.username}`);
            }
        })
        .catch((error) => {
            // handle error
            console.log(error);
        });
});

setInterval(() => {
    axios.get(`https://throwdown.tv/api/streamkey/${streamKey}`)
        .then((response) => {
            // Check if it works
            if (response.data.canstream === false) {
                const session = nms.getSession(id);
                session.reject();
            }
        })
        .catch((error) => {
            // handle error
            console.log(error);
        });
}, 10000);

nms.on(`donePlay`, (id, StreamPath, args) => {
    const session = nms.getSession(id);
    session.reject();
});

const getStreamKeyFromStreamPath = (path) => {
    const parts = path.split(`/`);
    return parts[parts.length - 1];
};

// Export server.
module.exports = server;
