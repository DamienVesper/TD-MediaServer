const NodeMediaServer = require('node-media-server');
const mongoose = require('mongoose');
const User = require('./models/User');
const db = require('./config/keys').mongoURI;

const config = {
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
    trans: {
        ffmpeg: '/usr/bin/ffmpeg',
        tasks: [
            {
                app: 'live',
                hls: true,
                hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
                dash: false,
                dashFlags: '[f=dash:window_size=3:extra_window_size=5]'
            }
        ]
    }
};

mongoose
    .connect(
        db,
        { useNewUrlParser: true ,useUnifiedTopology: true}
    )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

var nms = new NodeMediaServer(config)
nms.run();

nms.on('prePublish', async (id, StreamPath, args) => {
    let stream_key = getStreamKeyFromStreamPath(StreamPath);
    console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);

    User.findOne({stream_key: stream_key}, (err, user) => {
        if (!err) {
            if (!user) {
                let session = nms.getSession(id);
                session.reject();
                console.log("Stream key does not exist")
            } else {
                console.log("Stream key does exist")
            }
        }
    });
});

const getStreamKeyFromStreamPath = (path) => {
    let parts = path.split('/');
    return parts[parts.length - 1];
};