require(`dotenv`).config();

const NodeMediaServer = require(`node-media-server`);
const log = require(`./utils/log.js`);
const generateThumbnail = require(`./utils/generateThumbnail.js`);
const axios = require(`axios`);

const config = require(`../config/config.js`);
const rtmpConfig = require(`../config/rtmpConfig.js`);
const fs = require(`fs`);

const mediadirectory = `../media`;

if (fs.existsSync(mediadirectory)) fs.rmdirSync(mediadirectory);
if (!fs.existsSync(mediadirectory)) fs.mkdirSync(mediadirectory);

const server = new NodeMediaServer(rtmpConfig);
require(`./webfront.js`);

// Livestream array.
const streams = [];

// Log errors in a different color.
process.on(`uncaughtException`, err => log(`red`, err.stack));

// Start the server.
server.run();

server.on(`prePublish`, async (id, streamPath, args) => {
    if (!id || !streamPath) return;

    const streamKey = getStreamKeyFromStreamPath(streamPath);

    const session = server.getSession(id);
    axios.get(`${config.webPath}/api/stream-key/${streamKey}`).then(res => {
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

        axios.post(`${config.webPath}/api/change-streamer-status`, {
            streamer: data.username,
            apiKey: process.env.FRONTEND_API_KEY,
            streamerStatus: true
        }).then(res => {
            if (res.data.errors) {
                session.reject();
                log(`red`, res.data.errors);
            }
            else {
                log(`magenta`, `User established to stream with valid stream key.`);
                generateThumbnail(streamKey);
                streams.push({
                    id,
                    streamKey,
                    username: data.username
                });
            }
        });
    }).catch(() => {
        log(`red`, `Failed to verify streamer.`);
        session.reject();
    });
});

server.on(`donePublish`, id => {
    const session = server.getSession(id);
    const streamerData = streams.find(stream => stream.id === id);

    axios.post(`${config.webPath}/api/change-streamer-status`, {
        streamer: streamerData.username,
        apiKey: process.env.FRONTEND_API_KEY,
        streamerStatus: false
    }).then(res => {
        if (res.data.errors) {
            session.reject();
            log(`red`, res.data.errors);
        }
        else {
            streams.splice(streams.indexOf(streamerData), 1);
            log(`magenta`, `User Disconnected.`);
        }
    });

    session.reject();
});

const getStreamKeyFromStreamPath = path => {
    const parts = path.split(`/`);
    return parts[parts.length - 1];
};

// Export server.
module.exports = server;
