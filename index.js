const NodeMediaServer = require(`node-media-server`);
const axios = require(`axios`);
const systemconfig = require(`./config/config`);

const config = {
    server: {
        secret: `kjVkuti2xAyF3JGCzSZTk0NiggERYWM5JhI9mgQW4rytXc`
    },
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 
    },
    http: {
        port: 80,
        mediaroot: `./media`,
        allow_origin: `*`
    },
    https: {
        port: 443,
        key: `./throwdown.key`,
        cert: `./throwdown.crt`
    },
    auth: {
        api: true,
        api_user: `admin`,
        api_pass: `loltdtv2021`
    }
};

const nms = new NodeMediaServer(config);
let streamKey;
nms.run();
nms.on(`prePublish`, async (id, StreamPath, args) => {
    streamKey = getStreamKeyFromStreamPath(StreamPath);
    console.log(`[NodeEvent on prePublish]`, `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    await axios.get(`https://throwdown.tv/api/streamkey/${streamKey}`)
        .then(async (response) => {
            // Check if it works
            if (!response.data.canstream) {
                const session = nms.getSession(id);
                session.reject();
                console.log(`Stream key does not exist ${streamKey}`);
            } else {
                console.log(`Stream key does exist ${streamKey}`);
                await axios.get(`https://throwdown.tv/api/send_notification_email/${systemconfig.notificationapikey}/${response.data.username}`);
            }
        })
        .catch((error) => {
            // handle error
            console.log(error);
        });
});

setInterval(() => {
    axios.get(`https://throwdown.tv/api/streamkey/${streamKey}`)
        .then((response) => {
            // Check if it works
            if (response.data.canstream === false) {
                const session = nms.getSession(id);
                session.reject();
            }
        })
        .catch((error) => {
            // handle error
            console.log(error);
        });
}, 10000);

nms.on(`donePlay`, (id, StreamPath, args) => {
    const session = nms.getSession(id);
    session.reject();
});

const getStreamKeyFromStreamPath = (path) => {
    const parts = path.split(`/`);
    return parts[parts.length - 1];
};
