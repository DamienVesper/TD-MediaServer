const express = require(`express`);
const router = express.Router();
const config = require(`../../config/config.js`);
const axios = require(`axios`);
const path = require(`path`);
const fs = require(`fs`);
const http = require(`http`);

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

// Stream Feed.
router.get(`/stream_source/:streamer`, async (req, res) => {
    const streamer = req.params.streamer.toLowerCase();

    const getStreamKey = await axios.get(`https://${config.webfrontName}/api/rtmp-api/${streamer}/${process.env.FRONTEND_API_KEY}`);
    if (getStreamKey.data.errors) return res.json({ errors: `User does not exist` });

    res.setHeader(`content-disposition`, `attachment; filename=index.flv`);

    http.get(`http://localhost:${config.ports.nmsHTTP}/live/${getStreamKey.data.streamkey}.flv`, response => response.pipe(res));
});

// HLS
router.get(`/stream_hls/:streamer`, async (req, res) => {
    const streamer = req.params.streamer.toLowerCase();

    const getStreamKey = await axios.get(`https://${config.webfrontName}/api/rtmp-api/${streamer}/${process.env.FRONTEND_API_KEY}`);
    if (getStreamKey.data.errors) return res.json({ errors: `User does not exist` });

    res.setHeader(`content-disposition`, `attachment; filename=index.m3u8`);

    const filePath = `../../media/${req.url}`;

    fs.readFile(filePath, (error, content) => {
        res.writeHead(200, { 'Access-Control-Allow-Origin': `*` });
        if (error) {
            res.end();
        } else {
            res.end(content, `utf-8`);
        }
    });
});

/**

// 720
router.get(`/stream_720/:streamer`, async (req, res) => {
    const streamer = req.params.streamer.toLowerCase();

    const getStreamKey = await axios.get(`https://${config.webfrontName}/api/rtmp-api/${streamer}/${process.env.FRONTEND_API_KEY}`);
    if (getStreamKey.data.errors) return res.json({ errors: `User does not exist` });

    res.setHeader(`content-disposition`, `attachment; filename=index.flv`);

    http.get(`http://localhost:${config.ports.nmsHTTP}/live/${getStreamKey.data.streamkey}_720.flv`, response => response.pipe(res));
});

// 480
router.get(`/stream_480/:streamer`, async (req, res) => {
    const streamer = req.params.streamer.toLowerCase();

    const getStreamKey = await axios.get(`https://${config.webfrontName}/api/rtmp-api/${streamer}/${process.env.FRONTEND_API_KEY}`);
    if (getStreamKey.data.errors) return res.json({ errors: `User does not exist` });

    res.setHeader(`content-disposition`, `attachment; filename=index.flv`);

    http.get(`http://localhost:${config.ports.nmsHTTP}/live/${getStreamKey.data.streamkey}_480.flv`, response => response.pipe(res));
});

// 360
router.get(`/stream_360/:streamer`, async (req, res) => {
    const streamer = req.params.streamer.toLowerCase();

    const getStreamKey = await axios.get(`https://${config.webfrontName}/api/rtmp-api/${streamer}/${process.env.FRONTEND_API_KEY}`);
    if (getStreamKey.data.errors) return res.json({ errors: `User does not exist` });

    res.setHeader(`content-disposition`, `attachment; filename=index.flv`);

    http.get(`http://localhost:${config.ports.nmsHTTP}/live/${getStreamKey.data.streamkey}_360.flv`, response => response.pipe(res));
});

*/

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
