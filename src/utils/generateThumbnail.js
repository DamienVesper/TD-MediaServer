const { randomString } = require(`./random.js`);
const User = require(`../models/user.model.js`);
const spawn = require(`child_process`).spawn;
const log = require(`./log.js`);
const rtmpConfig = require(`../../config/rtmpConfig.js`);
const cmd = rtmpConfig.fission.ffmpeg;

module.exports = async (streamkey) => {
    log(`cyan`, `Checking for duplicate stream keys...`);

    const dbUsers = await User.find({});

    const streamKeys = [];
    for (const user of dbUsers) streamKeys.push(user.settings.streamKey);

    for (const user of dbUsers) {
        const usersWithSameStreamKey = await User.find({ 'settings.streamKey': user.settings.streamKey });

        if (usersWithSameStreamKey.length !== 1) {
            for (const user of usersWithSameStreamKey) {
                log(`blue`, `Duplicate stream key for ${user.username} found. Resetting...`);

                let newStreamKey = `${user.username}${randomString(32)}`;
                while (streamKeys.includes(newStreamKey)) newStreamKey = `${user.username}${randomString(32)}`;
                user.settings.streamKey = newStreamKey;
                user.save();
            }
        }
    }

    const args = [
        `-y`,
        `-i`, `http://127.0.0.1:8888/live/${streamkey}/index.m3u8`,
        `-ss`, `00:00:01`,
        `-vframes`, `1`,
        `-vf`, `scale=-2:300`,
        `media/${streamkey}.png`
    ];

    spawn(cmd, args, {
        detached: true,
        stdio: `ignore`
    }).unref();
};
