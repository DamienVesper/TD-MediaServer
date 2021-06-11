import { spawn } from 'child_process';
import log from './log';
import path from 'path';

const cmd = `/usr/bin/ffmpeg`;

const transcode = (username: string, streamKey: string) => {
    log(`magenta`, `Transcoding: ${streamKey}`);
    const args = [
        `-v`, `verbose`,
        `-y`,
        `-i`, `http://localhost:1935/live/${streamKey}`,
        `-c:v`,
        `-libx264`,
        `-c:a`, `aac`,
        `-ac`, `1`,
        `-strict`, `-2`,
        `-crf`, `18`,
        `-profile:v`, `baseline`,
        `-maxrate`, `250k`,
        `-bufsize`, `1835k`,
        `-pix_fmt`, `yuv420p`,
        `-flags`, `-global_header`,
        `-hls_time`, `10`,
        `-hls_list_size`, `6`,
        `-hls_wrap`, `10`,
        `-start_number`, `1`,
        `${path.resolve(__dirname, `../../public/${username}/index.m3u8`)}`
    ];

    spawn(cmd, args, {
        detached: true,
        stdio: `ignore`
    }).unref();
};

export default transcode;
