const NodeMediaServer = require(`node-media-server`);
const log = require(`./utils/log.js`);
const axios = require(`axios`);
const express = require(`express`);
const cors = require(`cors`);
const http = require(`http`);
const https = require(`https`);
const fs = require(`fs`);

const app = express();

const config = require(`../config/config.js`);
const rtmpConfig = require(`../config/rtmpConfig.js`);

const server = new NodeMediaServer(rtmpConfig);

// Express
app.use(cors());

// Routes
app.use(`/`, require(`./routes/index`));

// Log errors in a different color.
process.on(`uncaughtException`, err => log(`red`, err.stack));

// Start the server.
server.run();

server.on(`prePublish`, async (id, streamPath, args) => {
    if (!id || !streamPath) return;

    const streamkey = getStreamKeyFromStreamPath(streamPath);

    const session = server.getSession(id);
    axios.get(`https://${config.webfrontName}/api/stream-key/${streamkey}`).then(res => {
        const data = res.data;

        if (!data) {
            log(`red`, `User attempted to stream with invalid stream key.`);
            return session.reject();
        }

        // If the person cannot stream or the credentials were not verified by the server, then reject the session request.
        if (data.isSuspended || data.verified === false) {
            log(`red`, `User attempted to stream while being suspended or unverified.`);
            return session.reject();
        }
        log(`magenta`, `User established to stream with valid stream key.`);
    }).catch(() => {
        log(`red`, `Failed to verify streamer.`);
        session.reject();
    });
});

server.on(`donePlay`, id => {
    const session = server.getSession(id);
    session.reject();
});

const getStreamKeyFromStreamPath = (path) => {
    const parts = path.split(`/`);
    return parts[parts.length - 1];
};

// Create the webfront.
const webserver = config.mode === `dev`
    ? http.createServer(app)
    : https.createServer({
        key: fs.readFileSync(config.ssl.keyPath),
        cert: fs.readFileSync(config.ssl.certPath),
        requestCert: false,
        rejectUnauthorized: false
    }, app);

// Bind the webfront to defined port.
webserver.listen(config.ports.webfrontHttps, () => log(`green`, `Webfront bound to port ${config.ports.webfrontHttps}.`));

// Export server.
module.exports = server;
