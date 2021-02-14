require(`dotenv`).config();

const NodeMediaServer = require(`node-media-server`);
const log = require(`./utils/log.js`);
const axios = require(`axios`);

const config = require(`../config/config.js`);
const rtmpConfig = require(`../config/rtmpConfig.js`);

const server = new NodeMediaServer(rtmpConfig);
require(`./webfront.js`);

// Log errors in a different color.
process.on(`uncaughtException`, err => log(`red`, err.stack));

// Start the server.
server.run();

server.on(`prePublish`, async (id, streamPath, args) => {
    if (!id || !streamPath) return;

    const streamkey = getStreamKeyFromStreamPath(streamPath);

    const session = server.getSession(id);
    axios.get(`${config.webPath}/api/stream-key/${streamkey}`).then(res => {
        const data = res.data;

        if (!data) {
            log(`red`, `User attempted to stream with invalid stream key.`);
            return session.reject();
        }

        // If the person cannot stream or the credentials were not verified by the server, then reject the session request.
        if (data.isSuspended === true || data.verified === false) {
            log(`red`, `User attempted to stream while being suspended or unverified.`);
            return session.reject();
        }
        log(`magenta`, `User established to stream with valid stream key.`);
        axios.post(`https://${config.webfrontName}/api/stream-status/${streamkey}/true/${process.env.FRONTEND_API_KEY}`)
            .then(res => {
                if (res.data.success.length > 0) log(`green`, `Changed Live Status of stream key ${streamkey}`);
                else log(`red`, `Something went wrong changing Live Status of stream key ${streamkey}`);
            })
            .catch(err => log(`red`, `ERROR: ${err}`));
    }).catch(() => {
        log(`red`, `Failed to verify streamer.`);
        session.reject();
    });
});

server.on(`donePlay`, id => {
    const session = server.getSession(id);
    session.reject();
});

const getStreamKeyFromStreamPath = path => {
    const parts = path.split(`/`);
    return parts[parts.length - 1];
};

// Export server.
module.exports = server;
