import { spawn } from 'child_process';
import config from '../../config/config';
import path from 'path';

import log from './log';

const cmd = `/usr/bin/ffmpeg`;

const generateThumbnail = (streamKey: string) => {
    log(`magenta`, `Generating Stream Thumbnail For: ${streamKey}`);
    const args = [
        `-y`,
        `-i`, `http://localhost:${config.ports.nms}/live/${streamKey}.flv`,
        `-ss`, `00:00:01`,
        `-vframes`, `1`,
        `-vf`, `scale=-2:300`,
        `${path.resolve(__dirname, `../../media/${streamKey}.png`)}`
    ];

    spawn(cmd, args, {
        detached: true,
        stdio: `ignore`
    }).unref();
};

export default generateThumbnail;
