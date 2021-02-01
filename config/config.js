require(`dotenv`).config();
const pjson = require(`../package.json`);

const config = {
    mode: process.env.NODE_ENV,
    ssl: process.env.NODE_ENV === `prod`,
    domain: `${process.env.SERVER_NAME}.throwdown.tv`,
    version: pjson.version,
    ports: {
        webfront: process.env.NODE_ENV === `prod` ? 8945 : 3000,
        webfrontHttps: 8950,
        server: 1935
    }
};

config.ssl = {
    keyPath: `/etc/letsencrypt/live/${config.domain}/privkey.pem`,
    certPath: `/etc/letsencrypt/live/${config.domain}/fullchain.pem`
};

module.exports = config;
