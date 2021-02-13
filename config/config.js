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
        server: 1935,
        nmsHttp: process.env.NODE_ENV === `prod` ? 8946 : 3030,
        nmsHttps: 8951
    },
    webfrontName: `beta.throwdown.tv`
};

config.ssl = {
    keyPath: `/etc/letsencrypt/live/${config.domain}/privkey.pem`,
    certPath: `/etc/letsencrypt/live/${config.domain}/fullchain.pem`
};

module.exports = config;
