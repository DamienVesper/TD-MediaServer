import Express from 'express';

import config from '../../config/config';
import axios from 'axios';

import path from 'path';

const router: Express.Router = Express.Router();

// Index page.
router.get(`/`, async (req: Express.Request, res: Express.Response) => res.redirect(config.webfront));

// Stream Thumbnail.
router.get(`/thumbnail/:streamer`, async (req: Express.Request, res: Express.Response) => {
    const streamer = req.params.streamer.toLowerCase();

    const getStreamKey = await axios.get(`${config.webfront}/api/rtmp-api/${streamer}/${process.env.FRONTEND_API_KEY}`);

    if (getStreamKey.data.errors) return res.json({ errors: `User does not exist` });
    if (!getStreamKey.data.isLive) return res.sendFile(path.join(__dirname, `../../assets/thumbnail.png`));

    res.sendFile(path.join(__dirname, `../../media/${getStreamKey.data.streamkey}.png`));
});

// API
router.get(`/api/:streamer`, async (req: Express.Request, res: Express.Response) => {
    const streamer = req.params.streamer.toLowerCase();

    const getStreamKey = await axios.get(`${config.webfront}/api/rtmp-api/${streamer}/${process.env.FRONTEND_API_KEY}`);
    if (getStreamKey.data.errors) return res.json({ errors: `User does not exist` });

    const getStreamData = await axios.get(`http://localhost:${config.ports.nms}/api/streams/live/${getStreamKey.data.streamkey}`);

    const data = {
        isLive: getStreamData.data.isLive,
        viewers: getStreamData.data.viewers
    };

    res.json(data);
});

export default router;
