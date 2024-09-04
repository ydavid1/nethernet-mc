function detectAccountType(req) {
    return req.session.passport.user.type
}

module.exports = {
    detectAccountType
}