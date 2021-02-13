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

server.on(`prePublish`, async (id, streamer, streamKey) => {
    if (!id || !streamer || !streamKey) return;

    const session = server.getSession(id);
    axios.get(`https://${config.webfrontName}/api/${streamKey}`).then(res => {
        const data = res.data;

        // If the person cannot stream or the credentials were not verified by the server, then reject the session request.
        if (!data.canStream || !data.verified) {
            log(`cyan`, `User attempted to stream with invalid stream key.`);
            return session.reject();
        }
        else log(`magenta`, `User established to stream with valid stream key.`);
    }).catch(() => {
        log(`red`, `Failed to verify streamer.`);
        session.reject();
    });
});

server.on(`donePlay`, id => {
    const session = server.getSession(id);
    session.reject();
});

// Export server.
module.exports = server;
