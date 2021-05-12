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
    trans: {
        ffmpeg: `/usr/bin/ffmpeg`,
        tasks: [
            {
                app: `live`,
                hls: true,
                hlsFlags: `[hls_time=2:hls_list_size=3:hls_flags=delete_segments]`
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
