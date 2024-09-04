const express = require("express");
const router = express.Router();
const Nodeactyl = require("nodeactyl");
const node = require("jspteroapi");
const passport = require("passport");
const cloudflare = require("cloudflare");
const {
  hashPassword,
  createServer,
} = require("../utils/helpers");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const DiscordUser = require("../database/schemas/DiscordUser");
const LocalUser = require("../database/schemas/LocalUser");

let transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  // logger: true,
  debug: true,
  secureConnection: false,
  auth: {
    user: "officialnethernet@gmail.com",
    pass: "xxkz fpwt gedw mwii",
  },
  tls: {
    rejectUnauthorized: true,
  },
});

const origin = "https://panel.nethernet.org";

const jspteroClient = new node.Client(origin, process.env.api_key); // for Client API
const naClient = new Nodeactyl.NodeactylClient(origin, process.env.api_key);
const jspteroApp = new node.Application(origin, process.env.app_api_key);

const cf = new cloudflare({
  apiEmail: "yehudahdavid@gmail.com",
  apiKey: "b8830e4fc829c73a6a3151e94c0cba320a373",
});

function getRandomCombination(length = 4) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

router.get("/checkdomain/:domain", async (req, res) => {
  let newDomain = "";
  let wasntUnique = false;
  let records = await cf.dns.records
    .list({
      zone_id: "f553aa075dfd3dc89076cecd68592226",
    })
    .then((records) => {
      records.result.forEach((record) => {
        if (record.type == "SRV") {
          if (
            record.name == `_minecraft._tcp.${req.params.domain}.nethernet.org`
          ) {
            console.log("Found record");
            let alg = false;
            newDomain = `${req.params.domain}${getRandomCombination()}`;
            while (alg == false) {
              let unique = true;
              records.result.forEach((record) => {
                if (record.type == "SRV") {
                  if (
                    record.name == `_minecraft._tcp.${newDomain}.nethernet.org`
                  ) {
                    console.log("Found record");
                    newDomain = `${req.params.domain}${getRandomCombination()}`;
                    unique = false;
                  }
                }
              });
              if (unique == true) {
                alg = true;
              }
            }
            wasntUnique = true;
            res.json({ domain: newDomain, isTaken: true });
            // return res.status(400).json({ error: 'A server with that domain name already exists' });
          }
        }
      });
    });
  if (wasntUnique == false) {
    return res.json({ domain: req.params.domain, isTaken: false });
  }
  // return res.json({ domain: req.params.domain, isTaken: false });
});

router.get("/files/:serverId", async (req, res) => {
  if (!req.session.passport) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!req.session.passport.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (req.session.passport.user.type == "discord") {
    const discordUser = await DiscordUser.findById(
      req.session.passport.user.id
    );
    if (!discordUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!discordUser.mcServers[0][req.params.serverId]) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } else if (req.session.passport.user.type == "local") {
    const localUser = await LocalUser.findById(req.session.passport.user.id);
    if (!localUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!localUser.mcServers[0][req.params.serverId]) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }
  function replaceDotWithSlash(inputString) {
    return inputString.replace(/\./g, "/");
  }
  const serverId = req.params.serverId;
  // const directoryName = replaceDotWithSlash(req.params.directoryName);
  const directoryName = req.query.dir;
  console.log(directoryName);
  // return

  try {
    let files = await jspteroClient.getAllFiles(serverId, directoryName);
    res.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Failed to fetch files from the server" });
  }
});

router.get("/readfile/:serverId", async (req, res) => {
  if (!req.session.passport) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!req.session.passport.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (req.query.file == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (req.session.passport.user.type == "discord") {
    const discordUser = await DiscordUser.findById(
      req.session.passport.user.id
    );
    if (!discordUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!discordUser.mcServers[0][req.params.serverId]) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } else if (req.session.passport.user.type == "local") {
    const localUser = await LocalUser.findById(req.session.passport.user.id);
    if (!localUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!localUser.mcServers[0][req.params.serverId]) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }
  const serverId = req.params.serverId;
  const file = req.query.file;

  console.log(file);
  try {
    let fileContent = await jspteroClient.getFileContents(serverId, file);

    console.log(fileContent);

    if (fileContent == null) {
      return res.status(500).json({ error: "Failed to read file" });
    } else {
      res.json({ content: fileContent });
    }
  } catch (err) {
    console.log(err);
    return res.json({
      content: "Error Loading file. If issue persists, please contact support.",
    });
  }
});

router.post("/writefile/:serverId", async (req, res) => {
  if (!req.session.passport) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!req.session.passport.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (req.query.file == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (req.session.passport.user.type == "discord") {
    const discordUser = await DiscordUser.findById(
      req.session.passport.user.id
    );
    if (!discordUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!discordUser.mcServers[0][req.params.serverId]) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } else if (req.session.passport.user.type == "local") {
    const localUser = await LocalUser.findById(req.session.passport.user.id);
    if (!localUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!localUser.mcServers[0][req.params.serverId]) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }
  const serverId = req.params.serverId;
  const file = req.query.file;
  const content = req.body.content;

  await jspteroClient
    .writeFile(serverId, file, content)
    .then(() => {
      res.json({ success: true });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Failed" });
    });
});

router.post("/create", async (req, res) => {
  // console.log(req.body);
  console.log(req.body);
  if (
    !req.body.domainName ||
    !req.body.description ||
    !req.body.mcVersion ||
    !req.body.egg
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!req.session.passport) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!req.session.passport.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    if (req.session.passport.user.type == "discord") {
      const discordUser = await DiscordUser.findById(
        req.session.passport.user.id
      );
      if (!discordUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    } else if (req.session.passport.user.type == "local") {
      const localUser = await LocalUser.findById(req.session.passport.user.id);
      if (!localUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: "Unauthorized" });
  }
  let domain = req.body.domainName;
  const validDomainName = /^[a-zA-Z0-9]+$/;
  if (!validDomainName.test(domain)) {
    res
      .status(400)
      .json({ error: "Domain name can only contain letters and numbers" });
    return;
  }
  await createServer(
    jspteroApp,
    req.body.egg,
    domain,
    req.body.description,
    req.body.mcVersion,
    req,
    res,
    naClient
  );
  // res.json({ message: 'Success', instanceId: instanceId });
});

router.get("/delete/:serverId", async (req, res) => {
  let user;
  if (!req.session.passport) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!req.session.passport.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (req.session.passport.user.type == "discord") {
    user = await DiscordUser.findById(req.session.passport.user.id).catch(
      (err) => {
        console.log(err);
        return res.status(500).json({ success: false });
      }
    );
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!user.mcServers[0][req.params.serverId]) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } else if (req.session.passport.user.type == "local") {
    user = await LocalUser.findById(req.session.passport.user.id).catch(
      (err) => {
        console.log(err);
        return res.status(500).json({ success: false });
      }
    );
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!user.mcServers[0][req.params.serverId]) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }
  try {
    await jspteroApp
      .deleteServer(user.mcServers[0][req.params.serverId].internal_id, true)
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ success: false });
      })
      .then(async () => {
        if (req.session.passport.user.type == "local") {
          await LocalUser.findByIdAndUpdate(
            req.session.passport.user.id,
            {
              $unset: {
                [`mcServers.0.${req.params.serverId}`]: "",
              },
            },
            { new: true }
          )
            .catch((err) => {
              console.log(err);
              return res.status(500).json({ success: false });
            })
            .then(async () => {
              // remove the SRV record from cloudflare
              let records = await cf.dns.records
                .list({
                  zone_id: "f553aa075dfd3dc89076cecd68592226",
                })
                .then((records) => {
                  // console.log(records);
                  // itereate though the records
                  records.result.forEach((record) => {
                    if (record.type == "SRV") {
                      if (
                        record.name ==
                        `_minecraft._tcp.${
                          user.mcServers[0][req.params.serverId].domainName
                        }.nethernet.org`
                      ) {
                        console.log("Found record");
                        // delete the record
                        console.log(record.id);
                        cf.dns.records
                          .delete(record.id, {
                            zone_id: "f553aa075dfd3dc89076cecd68592226",
                          })
                          .then((response) => {
                            return res.json({ success: true });
                          })
                          .catch((err) => {
                            return res.status(500).json({ success: false });
                          });
                      }
                    }
                  });
                });
            });
        } else if (req.session.passport.user.type == "discord") {
          await DiscordUser.findOneAndUpdate(
            { discordId: user.discordId },
            {
              $unset: {
                [`mcServers.0.${req.params.serverId}`]: "",
              },
            },
            { new: true }
          )
            .catch((err) => {
              console.log(err);
              return res.status(500).json({ success: false });
            })
            .then(async () => {
              // remove the SRV record from cloudflare
              let records = await cf.dns.records
                .list({
                  zone_id: "f553aa075dfd3dc89076cecd68592226",
                })
                .then((records) => {
                  // console.log(records);
                  // itereate though the records
                  records.result.forEach((record) => {
                    if (record.type == "SRV") {
                      if (
                        record.name ==
                        `_minecraft._tcp.${
                          user.mcServers[0][req.params.serverId].domainName
                        }.nethernet.org`
                      ) {
                        console.log("Found record");
                        // delete the record
                        console.log(record.id);
                        cf.dns.records
                          .delete(record.id, {
                            zone_id: "f553aa075dfd3dc89076cecd68592226",
                          })
                          .then((response) => {
                            return res.json({ success: true });
                          })
                          .catch((err) => {
                            return res.status(500).json({ success: false });
                          });
                      }
                    }
                  });
                });
            });
        }
      });
  } catch (err) {
    console.log(err);
    // return res.status(500).json({ success: false });
  }
});

router.get("/serverstatus/:id", async (req, res) => {
  let ip;
  if (!req.session.passport) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!req.session.passport.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    if (req.session.passport.user.type == "discord") {
      const discordUser = await DiscordUser.findById(
        req.session.passport.user.id
      );
      if (!discordUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      if (!discordUser.mcServers[0][req.params.id]) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      ip = discordUser.mcServers[0][req.params.id].ip;
    } else if (req.session.passport.user.type == "local") {
      const localUser = await LocalUser.findById(req.session.passport.user.id);
      if (!localUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!localUser.mcServers[0][req.params.id]) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      ip = localUser.mcServers[0][req.params.id].ip;
    }
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: "Unauthorized" });
  }
  const serverId = req.params.id;
  let status = await naClient.getServerStatus(serverId).catch((err) => {
    console.log("Error getting server status");
    console.log(err);
    res.status(500).json({ error: "Failed to get server status" });
  });
  try {
    res.json({ status: status, ip: ip });
  } catch (err) {
    console.log(err);
  }
});

async function verifyCaptcha(req, res, next) {
  console.log("Verifying captcha");
  // console.log(req.body);
  const params = new URLSearchParams({
    secret: process.env.CAPTCHA_SECRET,
    response: req.body["g-recaptcha-response"],
    remoteip: req.ip,
  });

  await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    body: params,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        next();
      } else {
        // console.log('Captcha verification failed');
        res
          .status(400)
          .json({ message: "Invalid", reason: "Captcha verification failed" });
      }
    });
}

router.post(
  "/login",
  verifyCaptcha,
  passport.authenticate("local", { failWithError: true }),
  (req, res) => {
    console.log("Logged in");
    // res.redirect('/panel');
    // console.log(req.body);
    res.json({ message: "Success" });
    // res.sendStatus(200);
  },
  (err, req, res, next) => {
    console.log("Error logging in");
    console.log(err);
    if (err == "InvalidAuth") {
      return res
        .status(401)
        .json({ message: "Invalid", reason: "Invalid email or password" });
    } else if (err == "NotVerified") {
      return res
        .status(401)
        .json({ message: "Invalid", reason: "Email not verified" });
    } else {
      return res.status(401).json({
        message: "Invalid",
        reason: "Failed, make sure all fields are entered.",
      });
    }
  }
);

router.post("/register", verifyCaptcha, async (req, res) => {
  // console.log(req.body);
  if (!req.body.email || !req.body.password || !req.body.username) {
    return res
      .status(400)
      .json({ message: "Failed", reason: "Missing required fields" });
  }
  const { email, username } = req.body;
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ message: "Failed", reason: "Invalid email format" });
  }

  // Username format validation (exactly 5 characters, letters and numbers only)
  const usernameRegex = /^[A-Za-z0-9]{5,}$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({
      message: "Failed",
      reason:
        "Invalid username. Must be at least 5 characters long and contain only letters and numbers.",
    });
  }
  const user = await LocalUser.findOne({
    $or: [
      { email: { $regex: email, $options: "i" } },
      { username: { $regex: username, $options: "i" } },
    ],
  });
  if (user) {
    // console.log(user.email);
    // console.log(email);
    if (user.email.toLowerCase() == email.toLowerCase()) {
      return res
        .status(400)
        .json({ message: "Failed", reason: "Email already registered" });
    } else if (user.username.toLowerCase() == username.toLowerCase()) {
      return res
        .status(400)
        .json({ message: "Failed", reason: "Username already exists" });
    }
  } else {
    // const result = await detector.isTempMail(email);
    // if (result) {
    //   return res.status(400).json({ message: 'Failed', reason: 'Temporary email addresses are not allowed' });
    // }
    const password = hashPassword(req.body.password);
    console.log(password);
    const newUser = await LocalUser.create({ email, username, password });
    let mailOptions = {
      from: '"NetherNet" <officialnethernet@gmail.com>',
      to: email,
      subject: "NetherNet Email Verification",
      text: "Hello, please verify your email by clicking the link below",
      html: `<p>Hello, please verify your email by clicking the link below</p><a href="https://localhost/confirmation/${newUser._id}">Verify Email</a>`,
    };
    jwt.sign(
      {
        user: newUser.id,
      },
      process.env.EMAIL_SECRET,
      {
        expiresIn: "1d",
      },
      (err, emailToken) => {
        const url = `http://localhost/confirmation/${emailToken}`;

        transporter.sendMail(
          {
            from: '"NetherNet" <officialnethernet@gmail.com>',
            to: email,
            subject: "NetherNet Email Verification",
            text: "Hello, please verify your email by clicking the link below",
            html: `<p>Hello, please verify your email by clicking the link below. Link expires in 24h</p><a href="${url}">Verify Email</a>`,
          },
          function (error, info) {
            if (error) {
              console.log(error);
              return res.status(400).json({
                message: "Failed",
                reason: "Internal Server Issue. Please try again.",
              });
            } else {
              console.log("Email sent: " + info.response);
              return res.json({ message: "Success" });
            }
          }
        );
      }
    );
    // transporter.sendMail(mailOptions, function(error, info) {
    //   if (error) {
    //     console.log(error);
    //     return res.status(400).json({ message: 'Failed', reason: 'Internal Server Issue. Please try again.' });
    //   } else {
    //     console.log('Email sent: ' + info.response);
    //   }
    // });
  }
});

router.get("/discord", passport.authenticate("discord"), (req, res) => {
  res.send(200);
});

router.get(
  "/discord/redirect",
  passport.authenticate("discord"),
  (req, res) => {
    // res.send(200)
    res.redirect("/panel");
  }
);

router.get("/logout", (req, res) => {
  // req.logout(function(err) {
  //   if (err) {
  //     console.log(err);
  //     res.redirect('/');
  //   }
  //   res.redirect('/');
  // });
  req.session.destroy();
  res.clearCookie("connect.sid");
  res.redirect("/");
});

module.exports = router;
