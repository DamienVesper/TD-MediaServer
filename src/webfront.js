const config = require(`../config/config.js`);
const log = require(`./utils/log.js`);

const http = require(`http`);
const https = require(`https`);

const path = require(`path`);

const fs = require(`fs`);

const express = require(`express`);
const app = express();

// Handle CORS.
const cors = require(`cors`);
app.use(cors({ origin: `*` }));

// Middleware
const compression = require(`compression`);

app.use(compression());

// Routes
const indexRouter = require(`./routes/index.js`);
app.use(indexRouter);

const server = config.mode === `dev`
    ? http.createServer(app)
    : https.createServer({
        key: fs.readFileSync(config.ssl.keyPath),
        cert: fs.readFileSync(config.ssl.certPath),
        requestCert: false,
        rejectUnauthorized: false
    }, app);

// Bind the webfront to defined port.
server.listen(config.ports.webfront, () => log(`green`, `Webfront bound to port ${config.ports.webfront}.`));

module.exports = {
    app,
    server
};
