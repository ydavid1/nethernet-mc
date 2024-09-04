const express = require("express");
const Nodeactyl = require("nodeactyl");
const node = require("jspteroapi");
const axios = require("axios");
const DiscordUser = require("../database/schemas/DiscordUser");
const LocalUser = require("../database/schemas/LocalUser");
const util = require('minecraft-server-util');
const { getSoftware } = require("../utils/helpers");

const origin = "https://panel.nethernet.org";

const jspteroClient = new node.Client(origin, process.env.api_key); // for Client API
const naClient = new Nodeactyl.NodeactylClient(origin, process.env.api_key);
const jspteroApp = new node.Application(origin, process.env.app_api_key);

const router = express.Router();

router.get("/:id", async (req, res) => {
  let user;
  if (!req.session.passport) {
    return res.redirect("/");
  }
  if (!req.session.passport.user) {
    return res.redirect("/");
  }
  if (req.session.passport.user.type == "discord") {
    user = await DiscordUser.findById(req.session.passport.user.id);
    if (!user) {
      return res.redirect("/");
    }
    if (!user.mcServers[0][req.params.id]) {
      return res.redirect("/");
    }
  } else if (req.session.passport.user.type == "local") {
    user = await LocalUser.findById(req.session.passport.user.id);
    if (!user) {
      return res.redirect("/");
    }
    if (!user.mcServers[0][req.params.id]) {
      return res.redirect("/");
    }
  }

  const serverId = req.params.id;

  let status = "offline";
  try {
    status = await naClient.getServerStatus(serverId);
  } catch (err) {
    console.log(err);
  }
  let allocation = "example.nethernet.org:25565";
  let internalid;
  await jspteroClient
    .getServerInfo(serverId)
    .then((data) => {
      internalid = data.internal_id;
    })
    .catch((err) => {
      console.log(err);
    });
  let serverInf;
  await jspteroApp
    .getServerInfo(internalid)
    .then((data) => {
      serverInf = data;
      allocation = data.allocation;
    })
    .catch((err) => {
      console.log(err);
    });
  let final;
  let serverIP;
  let serverPort;
  let onlinePlayers;
  await jspteroApp
    .getAllAllocations(2)
    .then((data) => {
      final = `${data[allocation - 1].attributes.ip}:${
        data[allocation - 1].attributes.port
      }`;
      serverIP = data[allocation - 1].attributes.ip;
      serverPort = data[allocation - 1].attributes.port;
    })
    .catch((err) => {
      console.log(err);
    });
  let files;
  try {
    files = await jspteroClient.getAllFiles(serverId);
  } catch (err) {
    console.log(err);
    return res.redirect("/");
  }

  let software;
  let eggNum = serverInf.egg;

  console.log(eggNum);

  software = getSoftware(eggNum);
  let version;

  if (serverInf.container.environment.MINECRAFT_VERSION == null) {
    version = serverInf.container.environment.MC_VERSION;
  } else {
    version = serverInf.container.environment.MINECRAFT_VERSION;
  }
  // const version = serverInf.container.environment.MINECRAFT_VERSION;
  // const version = "a version";

  console.log(serverInf.container.environment.MINECRAFT_VERSION);
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
  await util.status(serverIP, serverPort).then((response) => {
    onlinePlayers = response.players.online;
  }).catch((err) => {
    console.log(err);
  });
  console.log("Online Players: " + onlinePlayers);
  if (req.session.passport.user.type == "discord") {
    // console.log(`Found user: ${discordUser}`);
    const userInfo = await axios.get("https://discord.com/api/v10/users/@me", {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
      },
    });
    console.log(userInfo.data);
    // let userName = userInfo.data.username;
    let avatarLink = `https://cdn.discordapp.com/avatars/${userInfo.data.id}/${userInfo.data.avatar}.png`;
    res.render("server", {
      status: status,
      ip: final,
      serverfiles: files,
      formatBytes: formatBytes,
      sentId: serverId,
      user: userInfo.data,
      avatar: avatarLink,
      server: serverInf,
      software: software,
      version: version,
    });
  } else if (req.session.passport.user.type == "local") {
    avatarLink = "/assets/images/plainavatar.png";
    // console.log(serverInf);
    res.render("server", {
      status: status,
      ip: final,
      serverfiles: files,
      formatBytes: formatBytes,
      sentId: serverId,
      user: user,
      avatar: avatarLink,
      server: serverInf,
      software: software,
      version: version,
    });
  }
});

module.exports = router;
