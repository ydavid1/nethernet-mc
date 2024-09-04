const express = require('express');
const axios = require('axios');
const Nodeactyl = require('nodeactyl');
const { pterosocket } = require('pterosocket')
const node = require('jspteroapi');
const jwt = require('jsonwebtoken');
const DiscordUser = require('../database/schemas/DiscordUser');
const LocalUser = require('../database/schemas/LocalUser');
const router = express.Router();

const origin = "https://panel.nethernet.org";

const jspteroClient = new node.Client(origin, process.env.api_key); // for Client API
const naClient = new Nodeactyl.NodeactylClient(origin, process.env.api_key);
const naApp = new Nodeactyl.NodeactylApplication(origin, process.env.app_api_key)
const jspteroApp = new node.Application(origin, process.env.app_api_key);

router.get('/', async (req, res) => {
    if (req.session.passport) {
        try {
            if (req.session.passport.user.type == 'discord') {
                const discordUser = await DiscordUser.findById(req.session.passport.user.id);
                if (discordUser) {
                    // console.log(`Found user: ${discordUser}`);
                    const userInfo = await axios.get('https://discord.com/api/v10/users/@me', {
                        headers: {
                            Authorization: `Bearer ${discordUser.accessToken}`
                        }
                    });

                    let avatarLink = `https://cdn.discordapp.com/avatars/${userInfo.data.id}/${userInfo.data.avatar}.png`;

                    res.render('index', { user: userInfo.data, avatar: avatarLink})
                } else {
                    res.render('index')
                }
            } else if (req.session.passport.user.type == 'local') {
                const localUser = await LocalUser.findById(req.session.passport.user.id);
                if (localUser) {
                    res.render('index', { user: localUser, avatar: '/assets/images/plainavatar.png'})
                } else {
                    res.render('index')
                }
            }
        } catch (err) {
            res.render('index')
        }
    } else {
        res.render('index')
    }
});

router.get('/panel', async (req, res) => {
//   console.log(req.session);
//   console.log(req);
  if (req.session.passport) {
    try {
        if (req.session.passport.user.type == 'discord') {
            const discordUser = await DiscordUser.findById(req.session.passport.user.id);
            if (discordUser) {
                // console.log(`Found user: ${discordUser}`);
                const userInfo = await axios.get('https://discord.com/api/v10/users/@me', {
                    headers: {
                        Authorization: `Bearer ${discordUser.accessToken}`
                    }
                });
                // console.log(userInfo.data);
                let settingUpServers = [];
                let servers = discordUser.mcServers[0];
                // loop through each server inside the dictionary
                for (const [key, value] of Object.entries(servers)) {
                    let serverStatus = await naClient.getServerStatus(key).catch(err => {
                        console.log(err);
                        settingUpServers.push(key);
                    });
                    if (serverStatus == 'starting') {
                        settingUpServers.push(key);
                    }
                }
                // let userName = userInfo.data.username;
                let avatarLink = `https://cdn.discordapp.com/avatars/${userInfo.data.id}/${userInfo.data.avatar}.png`;

                res.render('panel', { user: userInfo.data, avatar: avatarLink, settingups: settingUpServers, servers: discordUser.mcServers[0]})
            } else {
                res.redirect('/')
            }
        } else if (req.session.passport.user.type == 'local') {
            const localUser = await LocalUser.findById(req.session.passport.user.id);
            if (localUser) {
                let servers = localUser.mcServers[0];
                let settingUpServers = [];
                for (const [key, value] of Object.entries(servers)) {
                    let serverStatus = await naClient.getServerStatus(key).catch(err => {
                        console.log(err);
                        settingUpServers.push(key);
                    });
                    if (serverStatus == 'starting') {
                        settingUpServers.push(key);
                    }
                }
                res.render('panel', { user: localUser, avatar: '/assets/images/plainavatar.png', settingups: settingUpServers, servers: localUser.mcServers[0]})
            } else {
                res.redirect('/')
            }
        }
    } catch (err) {
        console.log(err);
    }
  } else {
    res.redirect('/')
  }
})

router.get('/login', async (req,res) => {
    if (req.session.passport) {
        res.redirect('/panel')
    } else {
        // console.log(req.query);
        if (req.query.registered) {
            res.render('login', { registered: true })
        } else {
            res.render('login')
        }
    }
})

router.get('/register', async (req,res) => {
    if (req.session.passport) {
        res.redirect('/panel')
    } else {
        res.render('register')
    }
})

router.get('/editor', async (req,res) => {
    res.render('texteditor')
})

router.get('/confirmation/:token', async (req, res) => {
    try {
        const user = jwt.verify(req.params.token, process.env.EMAIL_SECRET);
        // console.log(user);
        await LocalUser.findByIdAndUpdate(user.user, { isVerified: true });

        res.redirect('/login')
    } catch (err) {
        res.send(err)
    }
})

module.exports = router;