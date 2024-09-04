// Check if user has access to server based on ID
async function hasServer(user, id) {
    if (!user.mcServers[0][id]) {
        return false
    } else {
        return true
    }
}

module.exports = {
    hasServer,
}
