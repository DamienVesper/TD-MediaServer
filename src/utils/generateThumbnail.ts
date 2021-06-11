import { spawn } from 'child_process';
import config from '../../config/config';
import ffmpeg from 'ffmpeg-static';

import log from './log';

const generateThumbnail = (streamKey: string) => {
    log(`magenta`, `Generating Stream Thumbnail For: ${streamKey}`);
    const args = [
        `-y`,
        `-i`, `http://localhost:${config.ports.nms}/live/${streamKey}.flv`,
        `-ss`, `00:00:01`,
        `-vframes`, `1`,
        `-vf`, `scale=-2:300`,
        `media/${streamKey}.png`
    ];

    spawn(ffmpeg, args, {
        detached: true,
        stdio: `ignore`
    }).unref();
};

export default generateThumbnail;
