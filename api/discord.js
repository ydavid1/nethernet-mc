const passport = require('passport');
const { Strategy } = require('passport-discord');
const DiscordUser = require('../database/schemas/DiscordUser');
const LocalUser = require('../database/schemas/LocalUser');

passport.serializeUser((obj, done) => {
    // console.log('Serializing user:', obj.id);
    // console.log(obj);
    let sendObj = {
        id: obj.id,
        type: obj.type
    }
    done(null, sendObj);
});

passport.deserializeUser(async (obj, done) => {
    // console.log(obj);
    // console.log('Deserializing user:', obj.id);
    try {
        if (obj.type == 'discord') {
            // console.log('Deserializing discord user:', obj.id);
            const user = await DiscordUser.findById(obj.id);
            // console.log('Deserialized user:', user);
            done(null, user);
        } else if (obj.type == 'local') {
            // console.log('Deserializing local user:', obj.id);
            const user = await LocalUser.findById(obj.id);
            // console.log('Deserialized user:', user);
            done(null, user);
        }
    } catch (err) {
        console.log('Error deserializing user:', err);
        done(err, null);
    }
});

passport.use(
    new Strategy({
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: process.env.DISCORD_CALLBACK_URL,
        scope: ['identify']
    }, async (accessToken, refreshToken, profile, done) => {
        console.log(accessToken, refreshToken);
        console.log(profile);
        try {
            const discordUser = await DiscordUser.findOne({ discordId: profile.id });
            if (discordUser) {
                console.log(`Found user: ${discordUser}`);
                // console.log(accessToken);
                discordUser.accessToken = accessToken;
                discordUser.refreshToken = refreshToken;
                await discordUser.save();
                let sendObj = {
                    id: discordUser.id,
                    type: 'discord'
                }
                return done(null, sendObj);
            } else {
                const newUser = await DiscordUser.create({
                    discordId: profile.id,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                });
                let sendObj = {
                    id: newUser.id,
                    type: 'discord'
                }
                console.log(`Created User: ${newUser}`);
                return done(null, sendObj);
            }
        } catch (err) {
            console.log(err);
            return done(err, null);
        }
    })
)