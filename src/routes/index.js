const express = require(`express`);
const router = express.Router();
const config = require(`../../config/config.js`);
const axios = require(`axios`);
const http = require(`http`);

// Index page.
router.get(`/`, async (req, res) => res.redirect(config.webPath));

// Stream Feed.
router.get(`/stream/:streamer`, async (req, res) => {
    const streamer = req.params.streamer.toLowerCase();

    const getStreamKey = await axios.get(`https://${config.webfrontName}/api/rtmp-api/${streamer}/${process.env.FRONTEND_API_KEY}`);
    if (getStreamKey.data.errors) return res.json({ errors: `User does not exist` });

    res.setHeader(`content-disposition`, `attachment; filename=index.flv`);

    http.get(`http://localhost:${config.ports.nmsHTTP}/live/${getStreamKey.data.streamkey}.flv`, response => response.pipe(res));
});

// API
router.get(`/api/:streamer`, async (req, res) => {
    const streamer = req.params.streamer.toLowerCase();

    const getStreamKey = await axios.get(`https://${config.webfrontName}/api/rtmp-api/${streamer}/${process.env.FRONTEND_API_KEY}`);
    if (getStreamKey.data.errors) return res.json({ errors: `User does not exist` });

    const getStreamData = await axios.get(`http://localhost:${config.ports.nmsHTTP}/api/streams/live/${getStreamKey.data.streamkey}`);

    const data = {
        isLive: getStreamData.data.isLive
    };
    res.json(data);
});

module.exports = router;
