import NodeMediaServer from 'node-media-server';

import axios from 'axios';
import rimraf from 'rimraf';

import path from 'path';
import fs from 'fs';

import log from './utils/log';
import generateThumbnail from './utils/generateThumbnail';

import config from '../config/config';
import rtmpConfig from '../config/rtmpConfig';
// eslint-disable-next-line no-unused-vars
import transcode from './utils/transcode';

// Media Folder
if (fs.existsSync(path.resolve(__dirname, `../media`))) rimraf.sync(path.resolve(__dirname, `../media`));
if (!fs.existsSync(path.resolve(__dirname, `../media`))) fs.mkdirSync(path.resolve(__dirname, `../media`));

// Public Folder
if (fs.existsSync(path.resolve(__dirname, `../public`))) rimraf.sync(path.resolve(__dirname, `../public`));
if (!fs.existsSync(path.resolve(__dirname, `../public`))) fs.mkdirSync(path.resolve(__dirname, `../public`));

const server = new NodeMediaServer(rtmpConfig);
import(`./webfront.js`);

// Livestream array.
const streams = [];

// Log errors in a different color.
process.on(`uncaughtException`, err => log(`red`, err.stack));

// Start the server.
server.run();

server.on(`prePublish`, async (id: any, streamPath: string, args) => {
    if (!id || !streamPath) return;

    const streamKey = getStreamKeyFromStreamPath(streamPath);

    const session = server.getSession(id);
    const streamerData = await axios.get(`${config.webfront}/api/stream-key/${process.env.FRONTEND_API_KEY}/${streamKey}`);
    const data = streamerData.data;

    if (!data || streamerData.status === 404) {
        log(`red`, `User attempted to stream with invalid stream key.`);
        return session.reject();
    }

    // If the person cannot stream or the credentials were not verified by the server, then reject the session request.
    if (data.isSuspended || !data.verified) {
        log(`red`, `User attempted to stream while being suspended or unverified.`);
        return session.reject();
    }

    // axios.post(`${config.webPath}/api/send-notifications`, {
    //     streamer: data.username,
    //     apiKey: process.env.NOTIFICATION_API_KEY
    // });

    axios.post(`${config.webfront}/api/change-streamer-status`, {
        streamer: data.username,
        apiKey: process.env.FRONTEND_API_KEY,
        streamerStatus: true,
        rtmpServer: config.subdomain
    }).then(res => {
        if (res.data.errors) {
            session.reject();
            log(`red`, res.data.errors);
        } else {
            log(`magenta`, `User established to stream with valid stream key.`);
            generateThumbnail(streamKey);
            // HLS TRANSCODING
            transcode(data.username, streamKey);
            streams.push({
                id,
                streamKey,
                username: data.username
            });
        }
    });
});

server.on(`donePublish`, (id: any, streamPath: string, args: any) => {
    const session = server.getSession(id);
    const streamerData = streams.find(stream => stream.id === id);
    // const streamKey = getStreamKeyFromStreamPath(streamPath);

    axios.post(`${config.webfront}/api/change-streamer-status`, {
        streamer: streamerData.username,
        apiKey: process.env.FRONTEND_API_KEY,
        streamerStatus: false,
        rtmpServer: `live`
    }).then(res => {
        if (res.data.errors) {
            log(`red`, res.data.errors);
            return session.reject();
        } else {
            // fs.rmdirSync(path.join(__dirname, `../public/${streamerData.username}`));
            streams.splice(streams.indexOf(streamerData), 1);
            log(`magenta`, `User Disconnected.`);
        }
    });

    session.reject();
});

const getStreamKeyFromStreamPath = (path: string) => {
    const parts = path.split(`/`);
    return parts[parts.length - 1];
};
