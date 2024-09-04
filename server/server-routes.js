const express = require("express");
const Nodeactyl = require("nodeactyl");
const node = require("jspteroapi");
const axios = require("axios");
const DiscordUser = require("../database/schemas/DiscordUser");
const LocalUser = require("../database/schemas/LocalUser");
const util = require('minecraft-server-util');
const accountTypeModule = require("../utils/Accounts/accountType") 
const accountReqsModule = require("../utils/Accounts/accountsReqs") 
const serverHelpers = require("../utils/Servers/serverHelpers")
const { getSoftware } = require("../utils/helpers");

const origin = "https://panel.nethernet.org";

const jspteroClient = new node.Client(origin, process.env.api_key); // for Client API

const router = express.Router();

router.get("/:id", async (req, res) => {
  let user = await accountTypeModule.getAccountUser(req) // Get the mongodb user off a persons req object
  
  // Check if user exists
  if (!accountTypeModule.hasPassport(req)) {
    return res.redirect("/");
  }

  // Failsafe in case the previous if doesnt work for some reason
  if (user == null) {
    return res.redirect("/")
  }

  // Check if user has access to the given server
  if (!accountReqsModule.hasServer(user, req.params.id)) {
    return res.redirect("/");
  }

  const serverId = req.params.id;

  // Get server's status
  let status = await serverHelpers.getServerStatus(serverId)
  
  // Get server's internal ID
  let internalid = await serverHelpers.getInternalID(serverId)

  // Check if we could obtain the server's internal ID
  if (internalid == null) {
    // If not, redirect to homepage
    return res.redirect("/")
    // TODO: Add error toasts after redirect.
  }

  let serverInf = await serverHelpers.getServerInfo(internalid)
  let final = await serverHelpers.getServerIP(internalid)
  // let onlinePlayers;

  // Get the server's files
  let files;
  try {
    files = await jspteroClient.getAllFiles(serverId);
  } catch (err) {
    console.log(err);
    return res.redirect("/");
  }

  // get the server egg (the software of the server, EG: Paper, Forge, etc.)
  let eggNum = serverInf.egg;
  const software = getSoftware(eggNum);

  // get MC version of server
  let version = await serverHelpers.getServerMCVersion(serverInf)

  // Format the size of files coming in. This function is passed to the frontend (the webpage)
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
  
  // await util.status(serverIP, serverPort).then((response) => {
  //   onlinePlayers = response.players.online;
  // }).catch((err) => {
  //   console.log(err);
  // });
  // console.log("Online Players: " + onlinePlayers);
  
  // Get the user's info and avatar to pass to the frontend
  const {userInfo, avatarLink} = await accountTypeModule.getAccountInfo(req, user)

  res.render("server", {
    status: status,
    ip: final,
    serverfiles: files,
    formatBytes: formatBytes,
    sentId: serverId,
    user: userInfo,
    avatar: avatarLink,
    server: serverInf,
    software: software,
    version: version,
  });
});

module.exports = router;
