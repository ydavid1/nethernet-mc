const Nodeactyl = require("nodeactyl");
const node = require("jspteroapi");

const origin = "https://panel.nethernet.org";

// get our API apps
const naClient = new Nodeactyl.NodeactylClient(origin, process.env.api_key);
const jspteroClient = new node.Client(origin, process.env.api_key)
const jspteroApp = new node.Application(origin, process.env.app_api_key);

// Gets a servers status off serverID
async function getServerStatus(serverId) {
    // Offline by default as a failsafe
    let status = "offline";
    try {
      status = await naClient.getServerStatus(serverId);
    } catch (err) {
      console.log(err);
    }

    return status
}

// Gets a server's internal id (The id identified by pterodactyl)
async function getInternalID(serverId) {
    let internalid = null
    await jspteroClient
        .getServerInfo(serverId)
        .then((data) => {
        internalid = data.internal_id;
        })
        .catch((err) => {
        console.log(err);
        });

    return internalid
}

// Get all of a server's info
async function getServerInfo(internalid) {
    let serverInf = null
    await jspteroApp
        .getServerInfo(internalid)
        .then((data) => {
            serverInf = data;
        })
        .catch((err) => {
            console.log(err);
        });

    return serverInf
}

// Get a server's allocation (Real IP)
async function getServerAllocation(internalid) {
    let allocation = null
    await jspteroApp
        .getServerInfo(internalid)
        .then((data) => {
            allocation = data.allocation;
        })
        .catch((err) => {
            console.log(err);
        });

    return allocation
}

// Gets a server's full IP
async function getServerIP(internalid) {
    const allocation = await getServerAllocation(internalid)
    let serverIP = "0.0.0.0:0"
    await jspteroApp
        .getAllAllocations(2)
        .then((data) => {
            serverIP = `${data[allocation - 1].attributes.ip}:${
                data[allocation - 1].attributes.port
            }`;
        })
        .catch((err) => {
            console.log(err);
        });

    return serverIP
}

async function getServerMCVersion(serverInf) {
    let version = null
    if (serverInf.container.environment.MINECRAFT_VERSION == null) {
        version = serverInf.container.environment.MC_VERSION;
      } else {
        version = serverInf.container.environment.MINECRAFT_VERSION;
      }
    
    return version
}

module.exports = {
    getServerStatus,
    getInternalID,
    getServerInfo,
    getServerIP,
    getServerAllocation,
    getServerMCVersion
}