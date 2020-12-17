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
    date: {
        type: Date,
        required: false
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;