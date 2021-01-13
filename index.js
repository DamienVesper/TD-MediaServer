const NodeMediaServer = require('node-media-server');
const axios = require('axios');
const User = require('./models/User')
const nodemailer = require('nodemailer');

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
};

var nms = new NodeMediaServer(config)
nms.run();
let transporter = nodemailer.createTransport({
    host: "smtp.throwdown.tv",
    port: 25,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "notifications@throwdown.tv", // generated ethereal user
        pass: "Dankmeme2000", // generated ethereal password
    },
    tls: {
        rejectUnauthorized: false
    }
});
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
                await User.findOne({ stream_key: stream_key }).then(useraccount => {
                    useraccount.followers.forEach(user => {
                        User.findOne({username: user}).then(useracc => {
                            let message = {
                                from: "Throwdown TV Notifications <notifications@throwdown.tv>",
                                to: useracc.email,
                                subject: user + " is now Live!",
                                text: `${useraccount.username} went live with the title "${useraccount.stream_title}". Watch here: https://throwdown.tv/${useraccount.username}` ,
                            };
                            transporter.sendMail(message, (error, info) => {
                                if (error) {
                                    return console.log(error);
                                }
                                console.log('Message sent: %s', info.messageId);
                            });
                        })
                    })
                })
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