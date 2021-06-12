import config from '../config/config';
import log from './utils/log';

import * as HTTP from 'http';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import indexRouter from './routes/index';
import apiRouter from './routes/api';

const app: express.Application = express();

// Middleware
app.use(cors());

app.use(`/`, indexRouter);
app.use(`/api`, apiRouter);
app.use(helmet({ contentSecurityPolicy: false }));

const server = HTTP.createServer(app);
server.listen(config.ports.webfront, () => log(`green`, `Webfront bound to port ${config.ports.webfront}.`));
