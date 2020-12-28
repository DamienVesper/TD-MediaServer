const NodeMediaServer = require('node-media-server');
const mongoose = require('mongoose');
const axios = require('axios');
const express = require('express');
const fs = require('fs')
const http = require('http');
const https = require('https');
const app = express()
const User = require('./models/User');

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

//VIDEO SERVING EXPRESS

const db = require('./config/keys').mongoURI;

mongoose
    .connect(
        db,
        { useNewUrlParser: true ,useUnifiedTopology: true}
    )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

var ssl_options = {
    key: fs.readFileSync( './throwdown.key' ),
    cert: fs.readFileSync( './throwdown.crt' )
}

app.get('/stream/:username', (req, res) => {
    User.findOne({username: req.params.username}).then(user => {
        if (user) {
            var streampath = 'https://' + req.hostname + '/live/' + user.stream_key + '.flv'
            https.request(streampath).pipe(res)
        }
    })
})

var httpServer = http.createServer(app)
var httpsServer = https.createServer(ssl_options, app);

httpServer.listen(8080);
httpsServer.listen(8443);