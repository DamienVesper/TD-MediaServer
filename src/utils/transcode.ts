import log from './log';
import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';
import ffmpeg from 'fluent-ffmpeg';

const transcode = (username: string, streamKey: string) => {
    log(`magenta`, `Transcoding: ${streamKey}`);
    if (!fs.existsSync(path.resolve(__dirname, `../../public/${username}`))) {
        mkdirp.sync(path.resolve(__dirname, `../../public/${username}`));
    }

    const end = async (username) => {
        log(`yellow`, `TRANSMUXING END: (${username}) ${streamKey}`);
        fs.readdir(path.resolve(__dirname, `../../public/${username}`), (err, files) => {
            if (!err) {
                files.forEach((filename) => {
                    if (filename.endsWith(`.ts`) ||
                    filename.endsWith(`.m3u8`) ||
                    filename.endsWith(`.mpd`) ||
                    filename.endsWith(`.m4s`) ||
                    filename.endsWith(`.tmp`)) {
                        fs.unlinkSync(`${path.resolve(__dirname, `../../public/${username}`)}/${filename}`);
                    }
                });
            }
        });
    };

    ffmpeg(`rtmp://127.0.0.1:1935/live/${streamKey}`, { timeout: 432000 }).addOptions([
        `-c:v h264`,
        `-c:a copy`,
        `-preset:v ultrafast`,
        `-ac 1`,
        `-strict -2`,
        `-crf 18`,
        `-profile:v baseline`,
        `-maxrate 100k`,
        `-bufsize 1835k`,
        `-pix_fmt yuv420p`,
        `-hls_time 10`,
        `-hls_list_size 6`,
        `-hls_wrap 10`,
        `-start_number 1`
    ]).output(`${path.resolve(__dirname, `../../public/${username}`)}/index.m3u8`).on(`end`, end).on(`error`, (error, stdout, stderr) => { log(`red`, `ERROR: ${error} STDERR: ${stderr}`); }).run();
};
export default transcode;
