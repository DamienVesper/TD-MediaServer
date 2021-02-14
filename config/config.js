require(`dotenv`).config();
const pjson = require(`../package.json`);

const config = {
    mode: process.env.NODE_ENV,
    ssl: process.env.NODE_ENV === `prod`,
    domain: `${process.env.SERVER_NAME}.throwdown.tv`,
    version: pjson.version,
    ports: {
        nmsHTTP: process.env.NODE_ENV === `prod` ? 8940 : 3000,
        nmsHTTPS: 8945,
        webfront: process.env.NODE_ENV === `prod` ? 8950 : 5000,
        server: 1935
    },
    webfrontName: `throwdown.tv`,
    devWebfront: `localhost:8080`
};

config.ssl = {
    keyPath: `/etc/letsencrypt/live/${config.domain}/privkey.pem`,
    certPath: `/etc/letsencrypt/live/${config.domain}/fullchain.pem`
};

config.webPath = config.mode === `prod` ? `https://${config.webfrontName}` : `http://${config.devWebfront}`;

module.exports = config;
