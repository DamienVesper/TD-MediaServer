import Express from 'express';

import config from '../../config/config';
import axios from 'axios';
import request from 'request-promise';

const router: Express.Router = Express.Router();

// Index page.
router.get(`/`, async (req: Express.Request, res: Express.Response) => res.redirect(config.webfront));

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

    request.get(`http://localhost:${config.ports.nms}/live/${getStreamKey.data.streamkey}.flv`, { highWaterMark: 1024000, encoding: null }).pipe(res, { highWaterMark: 1024000 });
});

export default router;
