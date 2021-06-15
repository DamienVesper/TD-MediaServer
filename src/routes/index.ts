import Express from 'express';

import config from '../../config/config';

const router: Express.Router = Express.Router();

// Index page.
router.get(`/`, async (req: Express.Request, res: Express.Response) => res.redirect(config.webfront));

// FLV Source Feed.
router.get(`/flv/:streamer`, async (req, res) => {
    res.status(403).send(`FLV Support Depricated.`);
});

export default router;
