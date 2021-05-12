const express = require(`express`);
const router = express.Router();
const config = require(`../../config/config.js`);
const axios = require(`axios`);
const path = require(`path`);
const http = require(`http`);
const fs = require(`fs`);

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

// FLV Feed.
router.get(`/stream_source/:streamer`, async (req, res) => {
    const streamer = req.params.streamer.toLowerCase();

    const getStreamKey = await axios.get(`https://${config.webfrontName}/api/rtmp-api/${streamer}/${process.env.FRONTEND_API_KEY}`);
    if (getStreamKey.data.errors) return res.json({ errors: `User does not exist` });

    res.setHeader(`content-disposition`, `attachment; filename=index.flv`);

    http.get(`http://localhost:${config.ports.nmsHTTP}/live/${getStreamKey.data.streamkey}.flv`, response => response.pipe(res));
});

// HLS Feed.
router.get(`/stream_hls/:streamer`, async (req, res) => {
    const streamer = req.params.streamer.toLowerCase();

    const getStreamKey = await axios.get(`https://${config.webfrontName}/api/rtmp-api/${streamer}/${process.env.FRONTEND_API_KEY}`);
    if (getStreamKey.data.errors) return res.json({ errors: `User does not exist` });

    res.setHeader(`content-disposition`, `attachment; filename=index.flv`);

    const filePath = `http://localhost:${config.ports.nmsHTTP}/live/${getStreamKey.data.streamkey}/index.m3u8`;

    fs.stat(filePath, (err, stats) => {
        if (!stats || err) {
            res.status(404).end();
        }
        else {
            let fileExt = filePath.slice(filePath.lastIndexOf(`.`));
            fileExt = fileExt && fileExt.toLowerCase() || fileExt;

            switch (fileExt) {
                case `.m3u8`:
                    res.status(200).set(`Content-Type`, `application/vnd.apple.mpegurl`);
                    fs.createReadStream(filePath).pipe(res);
                    break;
                case `.ts`:
                    res.status(200).set(`Content-Type`, `video/MP2T`);
                    fs.createReadStream(filePath).pipe(res);
                    break;
                default:
                    res.status(400).send(`Unexpected file type ${fileExt}`);
            }
        }
    });
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
