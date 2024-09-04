const mongoose = require('mongoose');

const LocalUserSchema = new mongoose.Schema({
    email: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    username: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    password: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    mcServers: {
        type: mongoose.SchemaTypes.Array,
        required: true,
        default: {}
    },
    isVerified: {
        type: mongoose.SchemaTypes.Boolean,
        required: true,
        default: false
    },
    createdAt: {
        type: mongoose.SchemaTypes.Date,
        required: true,
        default: new Date()
    }
});

module.exports = mongoose.model('local_users', LocalUserSchema);