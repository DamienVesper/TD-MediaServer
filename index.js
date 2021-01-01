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
        api: true,
        api_user: 'admin',
        api_pass: 'loltdtv2021'
    },
    trans: {
        ffmpeg: '/usr/bin/ffmpeg',
        tasks: [
            {
            app: 'live',
            hls: true,
            hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
            dash: true,
            dashFlags: '[f=dash:window_size=3:extra_window_size=5]'
            }
        ]
    },
    fission: {
        ffmpeg: '/usr/bin/ffmpeg',
        tasks: [
            {
                rule: "stream/*",
                model: [
                {
                    ab: "128k",
                    vb: "1000k",
                    vs: "1280x720",
                    vf: "30",
                },
                {
                    ab: "96k",
                    vb: "800k",
                    vs: "854x480",
                    vf: "30",
                },
                {
                    ab: "96k",
                    vb: "600k",
                    vs: "640x360",
                    vf: "30",
                },
                ]
            },
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

setInterval(function(){
    axios.get('https://throwdown.tv/api/streamkey/' + stream_key)
        .then(function (response) {
            // Check if it works
            if (response.data.canstream === false) {
                let session = nms.getSession(id);
                session.reject();
            }
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
}, 10000)

nms.on('donePlay', (id, StreamPath, args) => {
    let session = nms.getSession(id);
    session.reject();
});

const getStreamKeyFromStreamPath = (path) => {
    let parts = path.split('/');
    return parts[parts.length - 1];
};