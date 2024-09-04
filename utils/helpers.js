const bcrypt = require("bcryptjs");
const fetch = require("node-fetch");
const cloudflare = require("cloudflare");
const DiscordUser = require("../database/schemas/DiscordUser");
const LocalUser = require("../database/schemas/LocalUser");

async function getServerDownloadLink(version) {
  const url = "https://launchermeta.mojang.com/mc/game/version_manifest.json";

  try {
    const response = await fetch(url);
    const data = await response.json();

    const versionInfo = data.versions.find((v) => v.id === version);
    if (!versionInfo) {
      throw new Error(`Version ${version} not found.`);
    }

    const versionDetailsResponse = await fetch(versionInfo.url);
    const versionDetails = await versionDetailsResponse.json();

    const serverDownloadLink = versionDetails.downloads.server.url;
    return serverDownloadLink;
  } catch (error) {
    console.error("Error fetching server download link:", error);
  }
}

const cf = new cloudflare({
  apiEmail: "yehudahdavid@gmail.com",
  apiKey: "b8830e4fc829c73a6a3151e94c0cba320a373",
});

function hashPassword(password) {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, salt);
}

function comparePassword(raw, hash) {
  return bcrypt.compareSync(raw, hash);
}

function getSoftware(egg) {
  console.log(egg);
  if (egg == 1) {
    return "Sponge";
  } else if (egg == 2) {
    return "Vanilla";
  } else if (egg == 3) {
    console.log(egg);
    return "Forge";
  } else if (egg == 4) {
    return "Paper";
  } else if (egg == 5 || egg == 15) {
    return "Fabric";
  }
}

function getJavaImageTag(software, version) {
  // Extract the major and minor version from the full version string
  const [major, minor, patch] = version.split(".").map(Number);

  // Determine the appropriate Java version based on the Minecraft version and software
  if (
    (major === 1 && minor >= 20 && patch >= 5) ||
    (major === 1 && minor >= 21)
  ) {
    return "ghcr.io/pterodactyl/yolks:java_21"; // Java 21 for Minecraft 1.20.5 and above
  } else if (major === 1 && minor >= 18) {
    return "ghcr.io/pterodactyl/yolks:java_17"; // Java 17 for Minecraft 1.18 and above
  } else if (major === 1 && minor >= 17) {
    if (software.toLowerCase() === "vanilla") {
      return "ghcr.io/pterodactyl/yolks:java_16"; // Java 16 for Vanilla 1.17 and above
    } else {
      return "ghcr.io/pterodactyl/yolks:java_16"; // Java 16 for Paper/Spigot/Forge/Fabric 1.17 and above
    }
  } else if (major === 1 && minor >= 16) {
    if (
      software.toLowerCase() === "bungeecord" ||
      software.toLowerCase() === "waterfall"
    ) {
      return "ghcr.io/pterodactyl/yolks:java_11"; // Java 11 for BungeeCord/Waterfall 1.16 and below
    } else {
      return "ghcr.io/pterodactyl/yolks:java_8"; // Java 8 for Forge/Fabric/Vanilla/Paper/Spigot 1.16 and below
    }
  } else {
    return "ghcr.io/pterodactyl/yolks:java_8"; // Default to Java 8 for older versions
  }
}

async function createServer(
  jspteroApp,
  egg,
  domain,
  description,
  mcVersion,
  req,
  res,
  naClient
) {
  console.log(egg);
  let software = getSoftware(egg);

  console.log(software);

  let docker = getJavaImageTag(software, mcVersion);
  console.log(docker);

  let records = await cf.dns.records
    .list({
      zone_id: "f553aa075dfd3dc89076cecd68592226",
    })
    .then((records) => {
      records.result.forEach((record) => {
        if (record.type == "SRV") {
          if (
            record.name ==
            `_minecraft._tcp.${req.body.domainName}.nethernet.org`
          ) {
            console.log("Found record");
            domain = `${req.body.domainName}${getRandomCombination()}`;
            // return res.status(400).json({ error: 'A server with that domain name already exists' });
          }
        }
      });
    });
  let allocations = await jspteroApp.getAllAllocations(2);
  // loop through the allocations and find the first one that is available
  let allocationId = null;
  let final;
  for (let i = 0; i < allocations.length; i++) {
    if (allocations[i].attributes.assigned == false) {
      allocationId = allocations[i].attributes.id;
      final = `${allocations[i].attributes.ip}:${allocations[i].attributes.port}`;
      await cf.dns.records
        .create({
          zone_id: "f553aa075dfd3dc89076cecd68592226",
          type: "SRV",
          name: `_minecraft._tcp.${domain}.nethernet.org`,
          data: {
            priority: 0,
            weight: 0,
            port: allocations[i].attributes.port,
            target: "join.nethernet.org",
          },
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({ error: "Failed to create SRV record" });
        });
      break;
    }
  }
  console.log(allocationId);
  if (software == "Paper") {
    let dlLink = await getServerDownloadLink(mcVersion);
    await jspteroApp
      .createServer(
        domain,
        1,
        description,
        1,
        4,
        allocationId,
        null,
        { MINECRAFT_VERSION: mcVersion, DL_PATH: dlLink },
        0,
        4072,
        5120,
        null,
        null,
        null,
        null,
        docker,
        0,
        500,
        true
      )
      .then(async (data) => {
        console.log(data);
        const serverId = data.identifier;
        // add server to user's servers object
        if (req.session.passport.user.type == "local") {
          await LocalUser.findByIdAndUpdate(
            req.session.passport.user.id,
            {
              $set: {
                [`mcServers.0.${serverId}`]: {
                  domainName: domain,
                  description: req.body.description,
                  allocationId: allocationId,
                  ip: final,
                  internal_id: data.id,
                },
              },
            },
            { new: true }
          );
        } else if (req.session.passport.user.type == "discord") {
          await DiscordUser.findByIdAndUpdate(
            req.session.passport.user.id,
            {
              $set: {
                [`mcServers.0.${serverId}`]: {
                  domainName: domain,
                  description: req.body.description,
                  allocationId: allocationId,
                  ip: final,
                  internal_id: data.id,
                },
              },
            },
            { new: true }
          );
        }
        // const internal_id = (await jspteroClient.getServerInfo(serverId)).internal_id
        // console.log(internal_id);

        // Polling function to check if the server is started
        const checkServerStatus = async (serverId) => {
          let status = await naClient.getServerStatus(serverId);
          if (status == "offline") {
            return true;
          }
          // return serv.status == 'offline'; // Adjust this based on actual status response
        };

        // Polling loop to wait for server to be fully started
        const waitForServerStartup = async (
          serverId,
          interval = 10000,
          timeout = 600000
        ) => {
          const startTime = Date.now();
          while (Date.now() - startTime < timeout) {
            if (await checkServerStatus(serverId)) {
              return true;
            }
            await new Promise((resolve) => setTimeout(resolve, interval));
          }
          throw new Error("Server startup timed out");
        };
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await waitForServerStartup(serverId);
        res.json({ message: "Success", instanceId: serverId, ip: final });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ error: "Failed to create server" });
      });
  } else if (software == "Forge") {
    // check if mcversion is lower than 1.17. mcversion is a string
    console.log(mcVersion);
    let jarFile;
    const [major, minor, patch] = mcVersion.split(".").map(Number);
    if (major == 1 && minor < 17) {
      jarFile = `minecraft_server.${mcVersion}.jar`;
    } else {
      jarFile = "server.jar";
    }
    await jspteroApp
      .createServer(
        domain,
        1,
        description,
        1,
        3,
        allocationId,
        null,
        { MC_VERSION: mcVersion, SERVER_JARFILE: jarFile },
        0,
        4072,
        5120,
        null,
        null,
        null,
        null,
        docker,
        0,
        500,
        true
      )
      .then(async (data) => {
        console.log(data);
        const serverId = data.identifier;
        // add server to user's servers object
        if (req.session.passport.user.type == "local") {
          await LocalUser.findByIdAndUpdate(
            req.session.passport.user.id,
            {
              $set: {
                [`mcServers.0.${serverId}`]: {
                  domainName: domain,
                  description: req.body.description,
                  allocationId: allocationId,
                  ip: final,
                  internal_id: data.id,
                },
              },
            },
            { new: true }
          );
        } else if (req.session.passport.user.type == "discord") {
          await DiscordUser.findByIdAndUpdate(
            req.session.passport.user.id,
            {
              $set: {
                [`mcServers.0.${serverId}`]: {
                  domainName: domain,
                  description: req.body.description,
                  allocationId: allocationId,
                  ip: final,
                  internal_id: data.id,
                },
              },
            },
            { new: true }
          );
        }
        // const internal_id = (await jspteroClient.getServerInfo(serverId)).internal_id
        // console.log(internal_id);

        // Polling function to check if the server is started
        const checkServerStatus = async (serverId) => {
          let status = await naClient.getServerStatus(serverId);
          if (status == "offline") {
            return true;
          }
          // return serv.status == 'offline'; // Adjust this based on actual status response
        };

        // Polling loop to wait for server to be fully started
        const waitForServerStartup = async (
          serverId,
          interval = 10000,
          timeout = 600000
        ) => {
          const startTime = Date.now();
          while (Date.now() - startTime < timeout) {
            if (await checkServerStatus(serverId)) {
              return true;
            }
            await new Promise((resolve) => setTimeout(resolve, interval));
          }
          throw new Error("Server startup timed out");
        };
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await waitForServerStartup(serverId);
        res.json({ message: "Success", instanceId: serverId, ip: final });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ error: "Failed to create server" });
      });
  } else if (software == "Fabric") {
    // check if mcversion is lower than 1.17. mcversion is a string
    console.log(mcVersion);
    let jarFile = "server.jar";
    // const [major, minor, patch] = mcVersion.split(".").map(Number);
    // if (major == 1 && minor < 17) {
    //   jarFile = `minecraft_server.${mcVersion}.jar`;
    // } else {
    //   jarFile = "server.jar";
    // }
    await jspteroApp
      .createServer(
        domain,
        1,
        description,
        5,
        15,
        allocationId,
        null,
        { MC_VERSION: mcVersion, SERVER_JARFILE: jarFile },
        0,
        4072,
        5120,
        null,
        null,
        null,
        null,
        docker,
        0,
        500,
        true
      )
      .then(async (data) => {
        console.log(data);
        const serverId = data.identifier;
        // add server to user's servers object
        if (req.session.passport.user.type == "local") {
          await LocalUser.findByIdAndUpdate(
            req.session.passport.user.id,
            {
              $set: {
                [`mcServers.0.${serverId}`]: {
                  domainName: domain,
                  description: req.body.description,
                  allocationId: allocationId,
                  ip: final,
                  internal_id: data.id,
                },
              },
            },
            { new: true }
          );
        } else if (req.session.passport.user.type == "discord") {
          await DiscordUser.findByIdAndUpdate(
            req.session.passport.user.id,
            {
              $set: {
                [`mcServers.0.${serverId}`]: {
                  domainName: domain,
                  description: req.body.description,
                  allocationId: allocationId,
                  ip: final,
                  internal_id: data.id,
                },
              },
            },
            { new: true }
          );
        }
        // const internal_id = (await jspteroClient.getServerInfo(serverId)).internal_id
        // console.log(internal_id);

        // Polling function to check if the server is started
        const checkServerStatus = async (serverId) => {
          let status = await naClient.getServerStatus(serverId);
          if (status == "offline") {
            return true;
          }
          // return serv.status == 'offline'; // Adjust this based on actual status response
        };

        // Polling loop to wait for server to be fully started
        const waitForServerStartup = async (
          serverId,
          interval = 10000,
          timeout = 600000
        ) => {
          const startTime = Date.now();
          while (Date.now() - startTime < timeout) {
            if (await checkServerStatus(serverId)) {
              return true;
            }
            await new Promise((resolve) => setTimeout(resolve, interval));
          }
          throw new Error("Server startup timed out");
        };
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await waitForServerStartup(serverId);
        res.json({ message: "Success", instanceId: serverId, ip: final });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ error: "Failed to create server" });
      });
  }
}

module.exports = {
  hashPassword,
  comparePassword,
  getSoftware,
  createServer,
};
