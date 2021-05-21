const config = require(`../config/config.js`);
const log = require(`./utils/log.js`);

const http = require(`http`);

const express = require(`express`);
const app = express();

// Handle CORS.
const cors = require(`cors`);
app.use(cors({ origin: `*` }));

// Static Media Folder
app.use(express.static(`media`));

// Routes
const indexRouter = require(`./routes/index.js`);
app.use(indexRouter);

// Create the webfront.
const server = http.createServer(app);

// Bind the webfront to defined port.
server.listen(config.ports.webfront, () => log(`green`, `Webfront bound to port ${config.ports.webfront}.`));

module.exports = {
    app,
    server
};
