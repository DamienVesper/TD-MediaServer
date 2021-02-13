const express = require(`express`);
const router = express.Router();
const config = require(`../../config/config.js`);
const axios = require(`axios`);
const http = require(`http`);

// Index page.
router.get(`/`, async (req, res) => { res.redirect(`https://${config.webfrontName}`); });

// Landing page.
router.get(`/stream/:streamer`, async (req, res) => {
    const streamer = req.params.streamer.toLowerCase();
    const getStreamKey = await axios.get(`https://${config.webfrontName}/api/rtmp-api/${streamer}/${process.env.FRONTEND_API_KEY}`);
    if (getStreamKey.data.errors) return res.json({ errors: `User does not exist` });
    const externalReq = http.request({
        hostname: `localhost:8946`,
        path: `/live/${getStreamKey.streamkey}.flv`
    }, (externalRes) => {
        res.setHeader(`content-disposition`, `attachment; filename=index.flv`);
        externalRes.pipe(res);
    });
    externalReq.end();
});

module.exports = router;
