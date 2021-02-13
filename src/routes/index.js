const express = require(`express`);
const router = express.Router();
const config = require(`../../config/config.js`);
const axios = require(`axios`);
const http = require(`http`);

// Index page.
router.get(`/`, async (req, res) => res.redirect(config.webPath));

// Landing page.
router.get(`/stream/:streamer`, async (req, res) => {
    const streamer = req.params.streamer.toLowerCase();

    const getStreamKey = await axios.get(`${config.webPath}/api/rtmp-api/${streamer}/${process.env.FRONTEND_API_KEY}`);
    if (getStreamKey.data.errors) return res.json({ errors: `User does not exist` });

    const externalReq = http.request({
        host: `localhost:${config.nmsHTTP}`,
        path: `/live/${getStreamKey.data.streamkey}.flv`
    }, (externalRes) => {
        res.setHeader(`content-disposition`, `attachment; filename=index.flv`);
        externalRes.pipe(res);
    });
    externalReq.end();
});

module.exports = router;
