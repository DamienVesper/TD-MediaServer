const express = require(`express`);
const router = express.Router();
const config = require(`../../config/config.js`);
const axios = require(`axios`);
const request = require(`request`);

// Index page.
router.get(`/`, async (req, res) => { res.redirect(`https://${config.webfrontName}`); });

// Landing page.
router.get(`/stream/:streamer`, async (req, res) => {
    const streamer = req.params.streamer.toLowerCase();
    const getStreamKey = await axios.get(`https://${config.webfrontName}/api/rtmp-api/${streamer}/${process.env.FRONTEND_API_KEY}`);
    if (getStreamKey.data.errors) return res.json({ errors: `User does not exist` });
    console.log(getStreamKey.streamkey);
    const url = `http://localhost:8946/live/${getStreamKey.streamkey}.flv`;
    request.get(url).pipe(res);
});

module.exports = router;
