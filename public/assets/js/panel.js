function getSoftware(egg) {
  if (egg == 1) {
    return "Sponge";
  } else if (egg == 2) {
    return "Vanilla";
  } else if (egg == 3) {
    console.log(egg);
    return "Forge";
  } else if (egg == 4) {
    return "Paper";
  } else if (egg == 5) {
    return "Fabric";
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  const createServerBtn = document.querySelector(".create-server-btn");
  const modal = document.getElementById("serverModal");
  const closeBtn = document.querySelector(".close");
  const createBtn = document.querySelector(".create-btn");
  const serverList = document.getElementById("serverList");
  const softwareSelect = document.getElementById("serverSoftware");
  const versionSelect = document.getElementById("serverVersion");
  const compatabilities = await fetch("/assets/js/compatabilities.json").then(
    (response) => response.json()
  );

  softwareSelect.addEventListener("change", function () {
    // check compatabilities for if the software is compatible with the version\
    const software = getSoftware(softwareSelect.value);
    const versions = compatabilities[software];
    versionSelect.innerHTML = "";
    versions.forEach((version) => {
      const option = document.createElement("option");
      option.value = version;
      option.textContent = version;
      versionSelect.appendChild(option);
    });
  });

  createServerBtn.addEventListener("click", function () {
    modal.style.display = "block";
  });

  closeBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });

  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  createBtn.addEventListener("click", async function () {
    let domainName = document.querySelector(
      'input[type="text"]:nth-of-type(1)'
    ).value;
    const description = document.querySelector(
      'input[type="text"]:nth-of-type(2)'
    ).value;
    const software = softwareSelect.value;
    const version = versionSelect.value;
    const validDomainName = /^[a-zA-Z0-9]+$/;
    if (!validDomainName.test(domainName)) {
      alert("Domain name can only contain letters and numbers.");
      return;
    }

    // Optionally close the modal (if open)
    document.getElementById("serverModal").style.display = "none";

    // Check if the domain name is already taken by contacting the server
    await fetch("/api/checkdomain/" + domainName, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.isTaken == true) {
          domainName = data.domain;
        }
      });

    // Create a new server element
    const newServer = document.createElement("div");
    newServer.classList.add("server");

    const serverName = document.createElement("div");
    serverName.classList.add("server-name");
    serverName.textContent = domainName || "New Server";

    const serverInfo = document.createElement("div");
    serverInfo.classList.add("server-info");
    // serverInfo.setAttribute('data-tooltip', 'Creating');

    const spinnercontainer = document.createElement("div");
    spinnercontainer.classList.add("spinner-container");

    const spinner = document.createElement("div");
    spinner.classList.add("spinner");

    const tooltip = document.createElement("div");
    tooltip.classList.add("spinner-tooltip");
    tooltip.textContent = "Creating";

    spinnercontainer.appendChild(spinner);
    spinnercontainer.appendChild(tooltip);

    serverInfo.appendChild(spinnercontainer);
    // Append server name and server info to the new server element
    newServer.appendChild(serverName);
    newServer.appendChild(serverInfo);

    // Append the new server element to the server list
    serverList.appendChild(newServer);

    fetch("/api/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        domainName: domainName,
        description: description,
        egg: software,
        mcVersion: version,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        modal.style.display = "none";
        // delete spinner
        spinnercontainer.remove();
        serverInfo.textContent = serverName.textContent + ".nethernet.org";
        // make newserver clickable

        newServer.addEventListener("click", function () {
          window.location.href = `/server/${data.instanceId}`;
        });
        // redirect to /server/:id
        // window.location.href = `/server/${data.instanceId}`;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
  // loop through each server in the server list and add an event listener of click if the server is not in the process of starting
  const servers = document.querySelectorAll(".server");
  servers.forEach(async (server) => {
    if (server.querySelector(".spinner-container")) {
      // send a request to the server to get the server status and repeat until the server is not starting
      let offline = false;
      while (!offline) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        console.log("Checking server status");
        await fetch("/api/serverstatus/" + server.id, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            if (data.status == "offline") {
              offline = true;
              // remove spinner
              server.querySelector(".spinner-container").remove();
              // add the server ip to the server info
              const serverInfo = server.querySelector(".server-info");
              serverInfo.textContent = data.ip;
              // make the server clickable
              server.addEventListener("click", function () {
                window.location.href = `/server/${server.id}`;
              });
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    } else {
      server.addEventListener("click", function () {
        // check if there is a spinner

        // get the server id by the elements id
        const serverId = server.id;
        // redirect to /server/:id
        window.location.href = `/server/${serverId}`;
      });
    }
  });
});
