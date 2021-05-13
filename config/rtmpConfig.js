require(`dotenv`).config();
const config = require(`./config.js`);

const rtmpConfig = {
    logType: 3,
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
        port: config.ports.nmsHTTP,
        mediaroot: `./media`,
        allow_origin: `*`
    },
    auth: {
        api: false,
        api_user: `admin`,
        api_pass: process.env.RTMP_API_PASSWORD
    },
    fission: {
        ffmpeg: `C:/ffmpeg/bin/ffmpeg.exe`,
        tasks: [
            {
                rule: `live/*`,
                model: [
                    {
                        ab: `64k`,
                        vb: `700k`,
                        vs: `1280x720`,
                        vf: `30`
                    },
                    {
                        ab: `64k`,
                        vb: `500k`,
                        vs: `854x480`,
                        vf: `30`
                    }
                ]
            }
        ]
    }
};

if (config.mode === `prod`) {
    rtmpConfig.https = {
        port: config.ports.nmsHTTPS,
        key: config.ssl.keyPath,
        cert: config.ssl.certPath
    };
}

module.exports = rtmpConfig;
