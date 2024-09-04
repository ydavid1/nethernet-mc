const mongoose = require('mongoose');

const DiscordUserSchema = new mongoose.Schema({
    discordId: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    accessToken: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    refreshToken: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    mcServers: {
        type: mongoose.SchemaTypes.Array,
        required: true,
        default: {}
    },
    createdAt: {
        type: mongoose.SchemaTypes.Date,
        required: true,
        default: new Date()
    }
});

module.exports = mongoose.model('discord_users', DiscordUserSchema);