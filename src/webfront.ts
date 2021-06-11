import config from '../config/config';
import log from './utils/log';

import * as HTTP from 'http';

import express from 'express';
import helmet from 'helmet';

import indexRouter from './routes/index';

const app: express.Application = express();
app.use(indexRouter);
app.use(helmet({ contentSecurityPolicy: false }));

const server = HTTP.createServer(app);
server.listen(config.port, () => log(`green`, `Webfront bound to port ${config.port}.`));
