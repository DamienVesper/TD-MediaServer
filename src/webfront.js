const config = require(`../config/config.js`);

const http = require(`http`);
const https = require(`https`);

const fs = require(`fs`);
const log = require(`./utils/log.js`);

const express = require(`express`);
const app = express();

// Cross-Origin Resource Sharing
const cors = require(`cors`);

app.use(cors({
    origin: `*`
}));

/**
app.use(cors({
    origin: config.mode === `prod`
        ? config.webfrontName
        : config.devWebfront
}));
*/

// Middleware
const compression = require(`compression`);
const bodyParser = require(`body-parser`);

app.use(compression());
app.use(bodyParser.json({
    limit: `50mb`
}));

app.use(bodyParser.urlencoded({
    limit: `50mb`,
    extended: true
}));

// Routes
const indexRouter = require(`./routes/index.js`);
app.use(indexRouter);

// Create the webfront.
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