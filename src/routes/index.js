const express = require(`express`);
const router = express.Router();
const config = require(`../../config/config.js`);
const axios = require(`axios`);
const path = require(`path`);
const http = require(`http`);
const fs = require(`fs`);
const { app } = require(`../webfront.js`);

// Index page.
router.get(`/`, async (req, res) => res.redirect(config.webPath));

// Stream Thumbnail.
router.get(`/thumbnail/:streamer`, async (req, res) => {
    const streamer = req.params.streamer.toLowerCase();

    const getStreamKey = await axios.get(`https://${config.webfrontName}/api/rtmp-api/${streamer}/${process.env.FRONTEND_API_KEY}`);
    if (getStreamKey.data.errors) return res.json({ errors: `User does not exist` });
    if (!getStreamKey.data.isLive) return res.sendFile(path.join(__dirname, `../../assets/thumbnail.png`));
    res.sendFile(path.join(__dirname, `../../media/${getStreamKey.data.streamkey}.png`));
});

// FLV Source Feed.
router.get(`/stream_flv_source/:streamer`, async (req, res) => {
    const streamer = req.params.streamer.toLowerCase();

    const getStreamKey = await axios.get(`https://${config.webfrontName}/api/rtmp-api/${streamer}/${process.env.FRONTEND_API_KEY}`);
    if (getStreamKey.data.errors) return res.json({ errors: `User does not exist` });

    res.setHeader(`content-disposition`, `attachment; filename=index.flv`);

    http.get(`http://localhost:${config.ports.nmsHTTP}/live/${getStreamKey.data.streamkey}.flv`, response => response.pipe(res));
});

// HLS Source Feed.
router.get(`/stream_hls_source/:streamer`, async (req, res, next) => {
    const streamer = req.params.streamer.toLowerCase();

    const getStreamKey = await axios.get(`https://${config.webfrontName}/api/rtmp-api/${streamer}/${process.env.FRONTEND_API_KEY}`);
    if (getStreamKey.data.errors) return res.json({ errors: `User does not exist` });

    req.url = req.params.asset;
    // eslint-disable-next-line prefer-template
    // eslint-disable-next-line node/no-path-concat
    express.static(path.join(__dirname + `/media/live/${getStreamKey.data.streamkey}/`))(req, res, next);
});

// API
router.get(`/api/:streamer`, async (req, res) => {
    const streamer = req.params.streamer.toLowerCase();

    const getStreamKey = await axios.get(`https://${config.webfrontName}/api/rtmp-api/${streamer}/${process.env.FRONTEND_API_KEY}`);
    if (getStreamKey.data.errors) return res.json({ errors: `User does not exist` });

    const getStreamData = await axios.get(`http://localhost:${config.ports.nmsHTTP}/api/streams/live/${getStreamKey.data.streamkey}`);

    const data = {
        isLive: getStreamData.data.isLive,
        viewers: getStreamData.data.viewers
    };
    res.json(data);
});

module.exports = router;
