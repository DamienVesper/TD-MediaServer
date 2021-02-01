const NodeMediaServer = require(`node-media-server`);
const log = require(`./utils/log.js`);
const axios = require(`axios`);

const config = require(`../config/config.js`);
const rtmpConfig = require(`../config/rtmpConfig.js`);

const server = new NodeMediaServer(rtmpConfig);

// Log errors in a different color.
process.on(`uncaughtException`, err => log(`red`, err.stack));

// Start the server.
server.run();
server.on(`prePublish`, async (id, StreamPath, args) => {
    const streamKey = getStreamKeyFromStreamPath(StreamPath);
    console.log(`[NodeEvent on prePublish]`, `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    await axios.get(`https://throwdown.tv/api/streamkey/${streamKey}`)
        .then(async (response) => {
            // Check if it works
            if (!response.data.canstream) {
                const session = server.getSession(id);
                session.reject();
                console.log(`Stream key does not exist ${streamKey}`);
            } else {
                console.log(`Stream key does exist ${streamKey}`);
                await axios.get(`https://throwdown.tv/api/send_notification_email/${config.notificationAPIKey}/${response.data.username}`);
            }
        })
        .catch((error) => {
            // handle error
            console.log(error);
        });
});

server.on(`donePlay`, (id, StreamPath, args) => {
    const session = server.getSession(id);
    session.reject();
});

const getStreamKeyFromStreamPath = (path) => {
    const parts = path.split(`/`);
    return parts[parts.length - 1];
};
// Export server.
module.exports = server;
