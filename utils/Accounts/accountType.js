const DiscordUser = require("../../database/schemas/DiscordUser")
const LocalUser = require("../../database/schemas/LocalUser")

const axios = require("axios")

// Detects the account's login type
function detectAccountType(req) {
    if (req.session.passport) {
        return req.session.passport.user.type
    } else {
        return null
    }
}
// Gets the mongodb user of the account
async function getAccountUser(req) {
    const accType = detectAccountType(req)
    let user = null
    if (accType == "discord") {
        user = await DiscordUser.findById(req.session.passport.user.id);
    } else if (accType == "local") {
        user = await LocalUser.findById(req.session.passport.user.id);
    }

    return user
}

// Checks if the user is logged in/has passport configured
function hasPassport(req) {
    if (!req.session.passport) {
        return false
    }
    else if (!req.session.passport.user) {
        return false
    } else {
        return true
    }
}

// Get all the info of a user's account
async function getAccountInfo(req, user) {
    const accType = await detectAccountType(req)

    if (accType == "discord") {
        const discordInfo = await axios.get("https://discord.com/api/v10/users/@me", {
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
            },
        });

        let userInfo = discordInfo.data
        let avatarLink = `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png`;

        return {userInfo, avatarLink}
    } else if (accType == "local") {
        let userInfo = user
        let avatarLink = "/assets/images/plainavatar.png";
        return {userInfo, avatarLink}
    }
}

async function getAccountServers(user) {
    let servers = user.mcServers[0];

    return servers
}

module.exports = {
    detectAccountType,
    getAccountUser,
    hasPassport,
    getAccountInfo,
    getAccountServers
}
