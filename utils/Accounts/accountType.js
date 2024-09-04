const DiscordUser = require("../../database/schemas/DiscordUser")
const LocalUser = require("../../database/schemas/LocalUser")

function detectAccountType(req) {
    return req.session.passport.user.type
}

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

module.exports = {
    detectAccountType,
    getAccountUser
}
