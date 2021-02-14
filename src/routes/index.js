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

    res.setHeader(`content-disposition`, `attachment; filename=index.flv`);

    http.get(`http://localhost:${config.ports.nmsHTTP}/live/${getStreamKey.data.streamkey}.flv`, response => response.pipe(res));
});

module.exports = router;
