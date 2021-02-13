const express = require(`express`);
const router = express.Router();
const config = require(`../../config/config.js`);
const axios = require(`axios`);

// Index page.
router.get(`/`, async (req, res) => { res.redirect(`https://${config.webfrontName}`) })

// Landing page.
router.get(`/stream/:streamer`, async (req, res) => {
    const streamer = req.params.streamer.toLowerCase();
    const getStreamKey = await axios.get(`https://${config.webfrontName}/api/rtmp-api/${streamer}/${process.env.FRONTEND_API_KEY}`);
    const getStreamVideo = await axios.get(`http://localhost:8946/api/streams/live/${getStreamKey.streamkey}`, { auth: { username: `admin`, password: process.env.RTMP_API_PASSWORD } });
    if (getStreamKey.data.errors.length === 0) return res.json({ errors: `User does not exist` });
    if (!getStreamVideo.data.isLive) return res.json({ errors: `Streamer not live` });
    res.send(`IS LIVE`);
});

module.exports = router;
