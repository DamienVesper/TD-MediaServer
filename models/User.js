const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    stream_key: {
        type: String,
        required: false
    },
    stream_title: {
        type: String,
        required: false
    },
    stream_description: {
        type: String,
        required: false
    },
    avatar_url: {
        type: String,
        required: false
    },
    email_verification_key: {
        type: String,
        required: false
    },
    verification_status: {
        type: Boolean,
        required: false
    },
    donation_link: {
        type: String,
        required: false
    },
    can_stream: {
        type: Boolean,
        required: false
    },
    banned: {
        type: Boolean,
        required: false
    },
    date: {
        type: Date,
        required: false
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;