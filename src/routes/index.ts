import Express from 'express';

import config from '../../config/config';
import axios from 'axios';
import fetch from 'node-fetch';

const router: Express.Router = Express.Router();

// Index page.
router.get(`/`, async (req: Express.Request, res: Express.Response) => res.redirect(config.webfront));

// FLV Source Feed.
router.get(`/flv/:streamer`, (req, res) => {
    const streamer = req.params.streamer.toLowerCase();
    const post = {
        apiKey: process.env.FRONTEND_API_KEY,
        streamer: streamer
    };
    axios.post(`${config.webfront}/api/rtmp-api`, post).then((response) => {
        if (response.status === 404) return res.json({ errors: `User does not exist` });
        res.setHeader(`content-disposition`, `attachment; filename=index.flv`);
        fetch(`http://localhost:${config.ports.nms}/live/${response.data.streamkey}.flv`).then(r => r.body).then(s => { s.pipe(res); }).catch(e => { res.status(500).send(`Error.`); });
    }).catch((error) => {
        res.json({ errors: error });
    });
});

export default router;
