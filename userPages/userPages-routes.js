const express = require('express');
const Nodeactyl = require('nodeactyl');
const jwt = require('jsonwebtoken');
const LocalUser = require('../database/schemas/LocalUser');
const router = express.Router();

const accountTypeModule = require("../utils/Accounts/accountType") 

const origin = "https://panel.nethernet.org";
const naClient = new Nodeactyl.NodeactylClient(origin, process.env.api_key);

router.get('/', async (req, res) => {
    // Check if user exists
    if (!accountTypeModule.hasPassport(req)) {
        return res.render('index');
    }

    let user = await accountTypeModule.getAccountUser(req) // Get the mongodb user off a persons req object

    // Failsafe in case the previous if doesnt work for some reason
    if (user == null) {
        return res.render('index');
    }

    const {userInfo, avatarLink} = await accountTypeModule.getAccountInfo(req, user)

    res.render('index', { user: userInfo, avatar: avatarLink})
});

router.get('/panel', async (req, res) => {
    // Check if user exists
    if (!accountTypeModule.hasPassport(req)) {
        return res.redirect('/');
    }

    let user = await accountTypeModule.getAccountUser(req) // Get the mongodb user off a persons req object

    // Failsafe in case the previous if doesnt work for some reason
    if (user == null) {
        return res.redirect('/');
    }

    const {userInfo, avatarLink} = await accountTypeModule.getAccountInfo(req, user)

    let settingUpServers = [];
    let servers = await accountTypeModule.getAccountServers(user)

    for (const [key, value] of Object.entries(servers)) {
        let serverStatus = await naClient.getServerStatus(key).catch(err => {
            console.log(err);
            settingUpServers.push(key);
        });
        if (serverStatus == 'starting') {
            settingUpServers.push(key);
        }
    }

    res.render('panel', { user: userInfo, avatar: avatarLink, settingups: settingUpServers, servers: servers})
})

router.get('/login', async (req,res) => {
    // Check if user exists
    if (accountTypeModule.hasPassport(req)) {
        return res.redirect('/panel');
    } else {
        if (req.query.registered) {
            res.render('login', { registered: true })
        } else {
            res.render('login')
        }
    }
})

router.get('/register', async (req,res) => {
    if (accountTypeModule.hasPassport(req)) {
        return res.redirect('/panel');
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