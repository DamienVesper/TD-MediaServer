const NodeMediaServer = require('node-media-server');
const axios = require('axios');

const config = {
    server: {
        secret: "kjVkuti2xAyF3JGCzSZTk0NiggERYWM5JhI9mgQW4rytXc"
    },
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60
    },
    http: {
        port: 80,
        mediaroot: './media',
        allow_origin: '*'
    },
    https: {
        port: 443,
        key:'./throwdown.key',
        cert:'./throwdown.crt',
    },
    auth: {
        play: false,
        publish: false,
        secret: 'XDnigger123123123',
        api: true,
        api_user: 'admin',
        api_pass: 'loltdtv2021'
    },
    trans: {
        ffmpeg: '/usr/bin/ffmpeg',
        tasks: [
            {
                app: 'live',
                mp4: true,
                mp4Flags: '[movflags=frag_keyframe+empty_moov]',
            }
        ]
    }
};

var nms = new NodeMediaServer(config)
nms.run();

nms.on('prePublish', async (id, StreamPath, args) => {
    let stream_key = getStreamKeyFromStreamPath(StreamPath);
    console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    axios.get('https://throwdown.tv/api/streamkey/' + stream_key)
        .then(function (response) {
            // Check if it works
            if (!response.data.canstream) {
                let session = nms.getSession(id);
                session.reject();
                console.log("Stream key does not exist " + stream_key)
            } else {
                console.log("Stream key does exist " + stream_key)
            }
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
});

nms.on('donePlay', (id, StreamPath, args) => {
    let session = nms.getSession(id);
    session.reject();
});

const getStreamKeyFromStreamPath = (path) => {
    let parts = path.split('/');
    return parts[parts.length - 1];
};