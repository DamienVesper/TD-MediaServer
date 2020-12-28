const mongoose = require('mongoose');
const cryptoRandomString = require('crypto-random-string');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    stream_key: {
        type: String,
    },
    stream_title: {
        type: String,
    },
    stream_description: {
        type: String,
    },
    avatar_url: {
        type: String,
    },
    email_verification_key: {
        type: String,
    },
    verification_status: {
        type: Boolean,
    },
    donation_link: {
        type: String,
    },
    can_stream: {
        type: Boolean,
    },
    banned: {
        type: Boolean,
    },
    following: {
        type: Array,
    },
    followers: {
        type: Array,
    },
    live_viewers: {
        default: 0
    },
    date: {
        type: Date,
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;