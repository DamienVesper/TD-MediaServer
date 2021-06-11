import config from './config';

const rtmpConfig = {
    logType: 3,
    server: {
        secret: process.env.RTMP_TOKEN
    },

    rtmp: {
        port: 1935,
        chunk_size: 6000,
        gop_cache: true,
        ping: 30
    },

    http: {
        port: config.ports.nms,
        mediaroot: `./media`,
        allow_origin: `*`
    },

    auth: {
        api: true,
        api_user: `admin`,
        api_pass: process.env.RTMP_API_PASSWORD
    }
};

export default rtmpConfig;
