const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const socketIo = require("socket.io");
const http = require("http");
const Nodeactyl = require("nodeactyl");
const { pterosocket } = require("pterosocket");
const node = require("jspteroapi");
const passport = require("passport");
const session = require("express-session");
const mongoStore = require("connect-mongo");
const axios = require("axios");
const DiscordUser = require("./database/schemas/DiscordUser");

require("dotenv").config();

const origin = "https://panel.nethernet.org";

const jspteroClient = new node.Client(origin, process.env.api_key); // for Client API
const naClient = new Nodeactyl.NodeactylClient(origin, process.env.api_key);
const naApp = new Nodeactyl.NodeactylApplication(
  origin,
  process.env.app_api_key
);
const jspteroApp = new node.Application(origin, process.env.app_api_key);

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

require("./database");

const userPagesRoutes = require("./userPages/userPages-routes");
const apiRoutes = require("./api/api-routes");
const serverRoutes = require("./server/server-routes");

app.use(express.static(path.join(__dirname, "public")));

// app.use(passport.session());

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      // one day
      maxAge: 1000 * 60 * 60 * 24,
    },
    store: mongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "pug");
app.set("views", "./views");

require("./api/local");
require("./api/discord");

const PORT = 80;

app.use("/", userPagesRoutes);
app.use("/server", serverRoutes);
app.use("/api", apiRoutes);

app.post("/api/auth", passport.authenticate("local"), (req, res) => {});

// 404 handling
app.use(async (req, res, next) => {
  if (req.session.passport) {
    if (req.session.passport.user) {
      const discordUser = await DiscordUser.findById(
        req.session.passport.user.id
      );
      if (discordUser) {
        console.log(`Found user: ${discordUser}`);
        const userInfo = await axios.get(
          "https://discord.com/api/v10/users/@me",
          {
            headers: {
              Authorization: `Bearer ${discordUser.accessToken}`,
            },
          }
        );
        console.log(userInfo.data);
        let settingUpServers = [];
        let servers = discordUser.mcServers[0];
        // loop through each server inside the dictionary
        for (const [key, value] of Object.entries(servers)) {
          let serverStatus = await naClient
            .getServerStatus(key)
            .catch((err) => {
              console.log(err);
              settingUpServers.push(key);
            });
          if (serverStatus == "starting") {
            settingUpServers.push(key);
          }
        }
        // let userName = userInfo.data.username;
        let avatarLink = `https://cdn.discordapp.com/avatars/${userInfo.data.id}/${userInfo.data.avatar}.png`;

        res.status(404);
        res.render("404", {
          user: userInfo.data,
          avatar: avatarLink,
          url: req.url,
        });
        return;
      }
    }
  }

  if (req.accepts("html")) {
    res.render("404", { url: req.url });
    return;
  }
});

function checkInstanceStatus(id) {
  const params = { InstanceIds: [id] };

  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      let status = await naClient.getServerStatus(id);
      if (status == "running") {
        clearInterval(interval);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        resolve(true);
      }
    }, 2000); // Poll every 2 seconds
  });
}

function checkInstanceStatusOffline(id) {
  const params = { InstanceIds: [id] };

  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      let status = await naClient.getServerStatus(id);
      if (status == "offline") {
        clearInterval(interval);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        resolve(true);
      }
    }, 2000); // Poll every 2 seconds
  });
}

io.on("connection", async (socket) => {
  console.log("Client connected");

  const urlString = socket.request.headers.referer;

  // Split the URL by '/'
  const parts = urlString.split("/");

  // The server ID is the last part
  const serverId = parts[parts.length - 1];

  const psocket = new pterosocket(origin, process.env.api_key, serverId, false);

  await socket.join(serverId);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  socket.emit("fullconnected");

  let status = await naClient.getServerStatus(serverId).catch((err) => {
    return;
  });

  if (status == undefined) {
    await socket.emit("output", "Error: Server not found.");
    return;
  }

  try {
    const res = await jspteroClient.getFileContents(
      serverId,
      "logs/latest.log"
    );
    await socket.emit("cachedLogs", res);
  } catch (err) {
    console.log("must be first");
  }

  socket.on("stop", async (data) => {
    try {
      let status = await naClient.getServerStatus(serverId);

      console.log("status: ", status);

      if (status != "running" && status != "starting") {
        console.log("illegal stop");
        await socket.emit(
          "toast",
          "An error occured. If you just started the server, please wait a few seconds before stopping it."
        );
        throw "illegal stop";
        return;
      }

      await socket.broadcast
        .to(serverId)
        .emit("changingserverstate", "Stopping...");
      console.log("Stopping server:", data);
      await jspteroClient.setPowerState(serverId, "stop");
      await checkInstanceStatusOffline(serverId);
      console.log("server stopped");
    } catch (err) {
      console.log(err);
      await io.to(serverId).emit("started");
    }

    // await io.to(serverId).emit("stopped");
  });

  socket.on("command", async (command) => {
    if (command == "stop") {
      await socket.emit(
        "output",
        "Error: You cannot use the stop command here. Please use the stop button to stop the server."
      );
      return;
    }
    try {
      await jspteroClient.sendCommand(serverId, command);
    } catch (err) {
      await socket.emit(
        "output",
        `Error: You must have your server running to send commands.`
      );
    }
  });

  socket.on("disconnect", async () => {
    await socket.leave(serverId);
    console.log("Client disconnected");
  });

  socket.on("start", async (data) => {
    try {
      let status = await naClient.getServerStatus(serverId);

      console.log("status: ", status);

      if (status != "offline" && status != "stopping") {
        console.log("illegal start");
        await socket.emit(
          "toast",
          "An error occured. If you just stopped the server, please wait a few seconds before starting it."
        );
        throw "illegal start";
        return;
      }

      await socket.broadcast
        .to(serverId)
        .emit("changingserverstate", "Starting...");
      console.log("Starting server:", data);

      try {
        if (
          (await jspteroClient.getFileContents(serverId, "eula.txt")).includes(
            "eula=false"
          )
        ) {
          console.log("EULA not accepted");
          await jspteroClient.writeFile(serverId, "eula.txt", "eula=true");
        }
      } catch (err) {
        console.log("EULA not found");
      }

      await jspteroClient.setPowerState(serverId, "start");
      await checkInstanceStatus(serverId);
    } catch (err) {
      await io.to(serverId).emit("stopped");
    }
    // await io.to(serverId).emit("started");
  });

  // await new Promise((resolve) => setTimeout(resolve, 500));
  await psocket.connect();
  psocket.on("console_output", (data) => {
    // Define the regex pattern for the desired log format
    const logPattern = /^\[\d{2}:\d{2}:\d{2} INFO\]/;

    // Check if data starts with the log pattern
    // if (logPattern.test(data)) {

    // }
    socket.emit("output", data);
  });
  psocket.on("status", async (data) => {
    console.log("ptero: " + data);
    if (data == "running") {
      await io.to(serverId).emit("started");
    } else if (data == "offline") {
      await io.to(serverId).emit("stopped");
    } else if (data == "starting") {
      await io.to(serverId).emit("changingserverstate", "Starting...");
    } else if (data == "stopping") {
      await io.to(serverId).emit("changingserverstate", "Stopping...");
    }
    // await io.to(serverId).emit(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
