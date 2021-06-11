import { name, version } from '../package.json';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import * as dotenv from 'dotenv';
dotenv.config();

interface Args {
    mode: string;
    domain: string;
}

const argv = (yargs(hideBin(process.argv)).options({
    mode: { type: `string`, default: `dev` },
    domain: { type: `string`, default: `eu01` },
}).argv as Args);

const config = {
    name,
    mode: argv.mode,

    domain: `${argv.domain}.throwdown.tv`,

    ports: {
        nmsHTTP: argv.mode === `prod` ? 8945 : 3000,
        webfront: argv.mode === `prod` ? 8950 : 5000
    },

    webfront: argv.mode === `prod` ? `https://throwdown.tv` : `http://localhost:8080`,    
    version
};

export default config;
