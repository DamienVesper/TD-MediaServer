import Express from 'express';

import config from '../../config/config';
import axios from 'axios';

import path from 'path';
import http from 'http';

const router: Express.Router = Express.Router();

// Index page.
router.get(`/`, async (req: Express.Request, res: Express.Response) => res.redirect(config.webfront));

// Stream Thumbnail.
router.get(`/thumbnail/:streamer`, async (req: Express.Request, res: Express.Response) => {
    const streamer = req.params.streamer.toLowerCase();

    const post = {
        apiKey: process.env.FRONTEND_API_KEY,
        streamer: streamer
    };

    const getStreamKey = await axios.post(`${config.webfront}/api/rtmp-api`, post);

    if (getStreamKey.data.errors) return res.json({ errors: `User does not exist` });
    if (!getStreamKey.data.isLive) return res.sendFile(path.join(__dirname, `../../assets/thumbnail.png`));

    res.sendFile(path.join(__dirname, `../../media/${getStreamKey.data.streamkey}.png`));
});

// FLV Source Feed.
router.get(`/flv/:streamer`, async (req, res) => {
    const streamer = req.params.streamer.toLowerCase();
    const post = {
        apiKey: process.env.FRONTEND_API_KEY,
        streamer: streamer
    };
    const getStreamKey = await axios.post(`${config.webfront}/api/rtmp-api`, post);
    if (getStreamKey.data.errors || getStreamKey.status === 404) return res.json({ errors: `User does not exist` });

    res.setHeader(`content-disposition`, `attachment; filename=index.flv`);

    http.get(`http://localhost:${config.ports.nms}/live/${getStreamKey.data.streamkey}.flv`, response => response.pipe(res));
});

// API
router.get(`/:streamer`, async (req: Express.Request, res: Express.Response) => {
    const streamer = req.params.streamer.toLowerCase();

    const post = {
        apiKey: process.env.FRONTEND_API_KEY,
        streamer: streamer
    };

    const getStreamKey = await axios.post(`${config.webfront}/api/rtmp-api`, post);
    if (getStreamKey.data.errors) return res.json({ errors: `User does not exist` });

    const getStreamData = await axios.get(`http://localhost:${config.ports.nms}/api/streams/live/${getStreamKey.data.streamkey}`, {
        auth: {
            username: `admin`,
            password: process.env.RTMP_API_PASSWORD
        }
    });

    const data = {
        isLive: getStreamData.data.isLive,
        viewers: getStreamData.data.viewers
    };

    res.json(data);
});

export default router;
