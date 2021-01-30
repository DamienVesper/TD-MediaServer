const config = require(`./config.js`);

const rtmpConfig = {
    server: {
        secret: process.env.RTMP_TOKEN
    },
    rtmp: {
        port: config.ports.server,
        chunk_size: 6000,
        gop_cache: true,
        ping: 30
    },
    http: {
        port: config.ports.webfront,
        mediaroot: `./media`,
        allow_origin: `*`
    },
    auth: {
        api: true,
        api_user: `admin`,
        api_pass: process.env.RTMP_API_PASSWORD
    }
};

if (config.mode === `prod`) {
    rtmpConfig.https = {
        port: config.ports.webfront,
        key: config.ssl.keyPath,
        cert: config.ssl.certPath
    };
}

module.exports = rtmpConfig;
