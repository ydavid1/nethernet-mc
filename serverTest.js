// const fetch = require("node-fetch");

// async function getServerDownloadLink(version) {
//   const url = "https://launchermeta.mojang.com/mc/game/version_manifest.json";

//   try {
//     const response = await fetch(url);
//     const data = await response.json();

//     const versionInfo = data.versions.find((v) => v.id === version);
//     if (!versionInfo) {
//       throw new Error(`Version ${version} not found.`);
//     }

//     const versionDetailsResponse = await fetch(versionInfo.url);
//     const versionDetails = await versionDetailsResponse.json();

//     const serverDownloadLink = versionDetails.downloads.server.url;
//     return serverDownloadLink;
//   } catch (error) {
//     console.error("Error fetching server download link:", error);
//   }
// }

// // Example usage:
// getServerDownloadLink("1.12.1").then((link) => {
//   if (link) {
//     console.log(`Server download link for version 1.16.5: ${link}`);
//   } else {
//     console.log("Failed to get server download link.");
//   }
// });

// Parse the JSON data
const versions = [
  {
    version: "1.21",
    stable: true,
  },
  {
    version: "1.21-rc1",
    stable: false,
  },
  {
    version: "1.21-pre4",
    stable: false,
  },
  {
    version: "1.21-pre3",
    stable: false,
  },
  {
    version: "1.21-pre2",
    stable: false,
  },
  {
    version: "1.21-pre1",
    stable: false,
  },
  {
    version: "24w21b",
    stable: false,
  },
  {
    version: "24w21a",
    stable: false,
  },
  {
    version: "24w20a",
    stable: false,
  },
  {
    version: "24w19b",
    stable: false,
  },
  {
    version: "24w19a",
    stable: false,
  },
  {
    version: "24w18a",
    stable: false,
  },
  {
    version: "1.20.6",
    stable: true,
  },
  {
    version: "1.20.6-rc1",
    stable: false,
  },
  {
    version: "1.20.5",
    stable: true,
  },
  {
    version: "1.20.5-rc3",
    stable: false,
  },
  {
    version: "1.20.5-rc2",
    stable: false,
  },
  {
    version: "1.20.5-rc1",
    stable: false,
  },
  {
    version: "1.20.5-pre4",
    stable: false,
  },
  {
    version: "1.20.5-pre3",
    stable: false,
  },
  {
    version: "1.20.5-pre2",
    stable: false,
  },
  {
    version: "1.20.5-pre1",
    stable: false,
  },
  {
    version: "24w14a",
    stable: false,
  },
  {
    version: "24w14potato",
    stable: false,
  },
  {
    version: "24w14potato_original",
    stable: false,
  },
  {
    version: "24w13a",
    stable: false,
  },
  {
    version: "24w12a",
    stable: false,
  },
  {
    version: "24w11a",
    stable: false,
  },
  {
    version: "24w10a",
    stable: false,
  },
  {
    version: "24w09a",
    stable: false,
  },
  {
    version: "24w07a",
    stable: false,
  },
  {
    version: "24w06a",
    stable: false,
  },
  {
    version: "24w05b",
    stable: false,
  },
  {
    version: "24w05a",
    stable: false,
  },
  {
    version: "24w04a",
    stable: false,
  },
  {
    version: "24w03b",
    stable: false,
  },
  {
    version: "24w03a",
    stable: false,
  },
  {
    version: "23w51b",
    stable: false,
  },
  {
    version: "23w51a",
    stable: false,
  },
  {
    version: "1.20.4",
    stable: true,
  },
  {
    version: "1.20.4-rc1",
    stable: false,
  },
  {
    version: "1.20.3",
    stable: true,
  },
  {
    version: "1.20.3-rc1",
    stable: false,
  },
  {
    version: "1.20.3-pre4",
    stable: false,
  },
  {
    version: "1.20.3-pre3",
    stable: false,
  },
  {
    version: "1.20.3-pre2",
    stable: false,
  },
  {
    version: "1.20.3-pre1",
    stable: false,
  },
  {
    version: "23w46a",
    stable: false,
  },
  {
    version: "23w45a",
    stable: false,
  },
  {
    version: "23w44a",
    stable: false,
  },
  {
    version: "23w43b",
    stable: false,
  },
  {
    version: "23w43a",
    stable: false,
  },
  {
    version: "23w42a",
    stable: false,
  },
  {
    version: "23w41a",
    stable: false,
  },
  {
    version: "23w40a",
    stable: false,
  },
  {
    version: "1.20.2",
    stable: true,
  },
  {
    version: "1.20.2-rc2",
    stable: false,
  },
  {
    version: "1.20.2-rc1",
    stable: false,
  },
  {
    version: "1.20.2-pre4",
    stable: false,
  },
  {
    version: "1.20.2-pre3",
    stable: false,
  },
  {
    version: "1.20.2-pre2",
    stable: false,
  },
  {
    version: "1.20.2-pre1",
    stable: false,
  },
  {
    version: "23w35a",
    stable: false,
  },
  {
    version: "23w33a",
    stable: false,
  },
  {
    version: "23w32a",
    stable: false,
  },
  {
    version: "23w31a",
    stable: false,
  },
  {
    version: "1.20.1",
    stable: true,
  },
  {
    version: "1.20.1-rc1",
    stable: false,
  },
  {
    version: "1.20",
    stable: true,
  },
  {
    version: "1.20-rc1",
    stable: false,
  },
  {
    version: "1.20-pre7",
    stable: false,
  },
  {
    version: "1.20-pre6",
    stable: false,
  },
  {
    version: "1.20-pre5",
    stable: false,
  },
  {
    version: "1.20-pre4",
    stable: false,
  },
  {
    version: "1.20-pre3",
    stable: false,
  },
  {
    version: "1.20-pre2",
    stable: false,
  },
  {
    version: "1.20-pre1",
    stable: false,
  },
  {
    version: "23w18a",
    stable: false,
  },
  {
    version: "23w17a",
    stable: false,
  },
  {
    version: "23w16a",
    stable: false,
  },
  {
    version: "23w14a",
    stable: false,
  },
  {
    version: "23w13a_or_b",
    stable: false,
  },
  {
    version: "23w13a_or_b_original",
    stable: false,
  },
  {
    version: "23w13a",
    stable: false,
  },
  {
    version: "23w12a",
    stable: false,
  },
  {
    version: "1.19.4",
    stable: true,
  },
  {
    version: "1.19.4-rc3",
    stable: false,
  },
  {
    version: "1.19.4-rc2",
    stable: false,
  },
  {
    version: "1.19.4-rc1",
    stable: false,
  },
  {
    version: "1.19.4-pre4",
    stable: false,
  },
  {
    version: "1.19.4-pre3",
    stable: false,
  },
  {
    version: "1.19.4-pre2",
    stable: false,
  },
  {
    version: "1.19.4-pre1",
    stable: false,
  },
  {
    version: "23w07a",
    stable: false,
  },
  {
    version: "23w06a",
    stable: false,
  },
  {
    version: "23w05a",
    stable: false,
  },
  {
    version: "23w04a",
    stable: false,
  },
  {
    version: "23w03a",
    stable: false,
  },
  {
    version: "1.19.3",
    stable: true,
  },
  {
    version: "1.19.3-rc3",
    stable: false,
  },
  {
    version: "1.19.3-rc2",
    stable: false,
  },
  {
    version: "1.19.3-rc1",
    stable: false,
  },
  {
    version: "1.19.3-pre3",
    stable: false,
  },
  {
    version: "1.19.3-pre2",
    stable: false,
  },
  {
    version: "1.19.3-pre1",
    stable: false,
  },
  {
    version: "22w46a",
    stable: false,
  },
  {
    version: "22w45a",
    stable: false,
  },
  {
    version: "22w44a",
    stable: false,
  },
  {
    version: "22w43a",
    stable: false,
  },
  {
    version: "22w42a",
    stable: false,
  },
  {
    version: "1.19.2",
    stable: true,
  },
  {
    version: "1.19.2-rc2",
    stable: false,
  },
  {
    version: "1.19.2-rc1",
    stable: false,
  },
  {
    version: "1.19.1",
    stable: true,
  },
  {
    version: "1.19.1-rc3",
    stable: false,
  },
  {
    version: "1.19.1-rc2",
    stable: false,
  },
  {
    version: "1.19.1-pre6",
    stable: false,
  },
  {
    version: "1.19.1-pre5",
    stable: false,
  },
  {
    version: "1.19.1-pre4",
    stable: false,
  },
  {
    version: "1.19.1-pre3",
    stable: false,
  },
  {
    version: "1.19.1-pre2",
    stable: false,
  },
  {
    version: "1.19.1-rc1",
    stable: false,
  },
  {
    version: "1.19.1-pre1",
    stable: false,
  },
  {
    version: "22w24a",
    stable: false,
  },
  {
    version: "1.19",
    stable: true,
  },
  {
    version: "1.19-rc2",
    stable: false,
  },
  {
    version: "1.19-rc1",
    stable: false,
  },
  {
    version: "1.19-pre5",
    stable: false,
  },
  {
    version: "1.19-pre4",
    stable: false,
  },
  {
    version: "1.19-pre3",
    stable: false,
  },
  {
    version: "1.19-pre2",
    stable: false,
  },
  {
    version: "1.19-pre1",
    stable: false,
  },
  {
    version: "22w19a",
    stable: false,
  },
  {
    version: "22w18a",
    stable: false,
  },
  {
    version: "22w17a",
    stable: false,
  },
  {
    version: "22w16b",
    stable: false,
  },
  {
    version: "22w16a",
    stable: false,
  },
  {
    version: "22w15a",
    stable: false,
  },
  {
    version: "22w14a",
    stable: false,
  },
  {
    version: "22w13oneblockatatime",
    stable: false,
  },
  {
    version: "22w13a",
    stable: false,
  },
  {
    version: "22w12a",
    stable: false,
  },
  {
    version: "22w11a",
    stable: false,
  },
  {
    version: "1.18.2",
    stable: true,
  },
  {
    version: "1.18.2-rc1",
    stable: false,
  },
  {
    version: "1.18.2-pre3",
    stable: false,
  },
  {
    version: "1.18.2-pre2",
    stable: false,
  },
  {
    version: "1.18.2-pre1",
    stable: false,
  },
  {
    version: "1.19_deep_dark_experimental_snapshot-1",
    stable: false,
  },
  {
    version: "22w07a",
    stable: false,
  },
  {
    version: "22w06a",
    stable: false,
  },
  {
    version: "22w05a",
    stable: false,
  },
  {
    version: "22w03a",
    stable: false,
  },
  {
    version: "1.18.1",
    stable: true,
  },
  {
    version: "1.18.1-rc3",
    stable: false,
  },
  {
    version: "1.18.1-rc2",
    stable: false,
  },
  {
    version: "1.18.1-rc1",
    stable: false,
  },
  {
    version: "1.18.1-pre1",
    stable: false,
  },
  {
    version: "1.18",
    stable: true,
  },
  {
    version: "1.18-rc4",
    stable: false,
  },
  {
    version: "1.18-rc3",
    stable: false,
  },
  {
    version: "1.18-rc2",
    stable: false,
  },
  {
    version: "1.18-rc1",
    stable: false,
  },
  {
    version: "1.18-pre8",
    stable: false,
  },
  {
    version: "1.18-pre7",
    stable: false,
  },
  {
    version: "1.18-pre6",
    stable: false,
  },
  {
    version: "1.18-pre5",
    stable: false,
  },
  {
    version: "1.18-pre4",
    stable: false,
  },
  {
    version: "1.18-pre3",
    stable: false,
  },
  {
    version: "1.18-pre2",
    stable: false,
  },
  {
    version: "1.18-pre1",
    stable: false,
  },
  {
    version: "21w44a",
    stable: false,
  },
  {
    version: "21w43a",
    stable: false,
  },
  {
    version: "21w42a",
    stable: false,
  },
  {
    version: "21w41a",
    stable: false,
  },
  {
    version: "21w40a",
    stable: false,
  },
  {
    version: "21w39a",
    stable: false,
  },
  {
    version: "21w38a",
    stable: false,
  },
  {
    version: "21w37a",
    stable: false,
  },
  {
    version: "1.18_experimental-snapshot-7",
    stable: false,
  },
  {
    version: "1.18_experimental-snapshot-6",
    stable: false,
  },
  {
    version: "1.18_experimental-snapshot-5",
    stable: false,
  },
  {
    version: "1.18_experimental-snapshot-4",
    stable: false,
  },
  {
    version: "1.18_experimental-snapshot-3",
    stable: false,
  },
  {
    version: "1.18_experimental-snapshot-2",
    stable: false,
  },
  {
    version: "1.18_experimental-snapshot-1",
    stable: false,
  },
  {
    version: "1.17.1",
    stable: true,
  },
  {
    version: "1.17.1-rc2",
    stable: false,
  },
  {
    version: "1.17.1-rc1",
    stable: false,
  },
  {
    version: "1.17.1-pre3",
    stable: false,
  },
  {
    version: "1.17.1-pre2",
    stable: false,
  },
  {
    version: "1.17.1-pre1",
    stable: false,
  },
  {
    version: "1.17",
    stable: true,
  },
  {
    version: "1.17-rc2",
    stable: false,
  },
  {
    version: "1.17-rc1",
    stable: false,
  },
  {
    version: "1.17-pre5",
    stable: false,
  },
  {
    version: "1.17-pre4",
    stable: false,
  },
  {
    version: "1.17-pre3",
    stable: false,
  },
  {
    version: "1.17-pre2",
    stable: false,
  },
  {
    version: "1.17-pre1",
    stable: false,
  },
  {
    version: "21w20a",
    stable: false,
  },
  {
    version: "21w19a",
    stable: false,
  },
  {
    version: "21w18a",
    stable: false,
  },
  {
    version: "21w17a",
    stable: false,
  },
  {
    version: "21w16a",
    stable: false,
  },
  {
    version: "21w15a",
    stable: false,
  },
  {
    version: "21w14a",
    stable: false,
  },
  {
    version: "21w13a",
    stable: false,
  },
  {
    version: "21w11a",
    stable: false,
  },
  {
    version: "21w10a",
    stable: false,
  },
  {
    version: "21w08b",
    stable: false,
  },
  {
    version: "21w08a",
    stable: false,
  },
  {
    version: "21w07a",
    stable: false,
  },
  {
    version: "21w06a",
    stable: false,
  },
  {
    version: "21w05b",
    stable: false,
  },
  {
    version: "21w05a",
    stable: false,
  },
  {
    version: "21w03a",
    stable: false,
  },
  {
    version: "1.16.5",
    stable: true,
  },
  {
    version: "1.16.5-rc1",
    stable: false,
  },
  {
    version: "20w51a",
    stable: false,
  },
  {
    version: "20w49a",
    stable: false,
  },
  {
    version: "20w48a",
    stable: false,
  },
  {
    version: "20w46a",
    stable: false,
  },
  {
    version: "20w45a",
    stable: false,
  },
  {
    version: "1.16.4",
    stable: true,
  },
  {
    version: "1.16.4-rc1",
    stable: false,
  },
  {
    version: "1.16.4-pre2",
    stable: false,
  },
  {
    version: "1.16.4-pre1",
    stable: false,
  },
  {
    version: "1.16.3",
    stable: true,
  },
  {
    version: "1.16.3-rc1",
    stable: false,
  },
  {
    version: "1.16_combat-3",
    stable: false,
  },
  {
    version: "1.16.2",
    stable: true,
  },
  {
    version: "1.16.2-rc2",
    stable: false,
  },
  {
    version: "1.16.2-rc1",
    stable: false,
  },
  {
    version: "1.16.2-pre3",
    stable: false,
  },
  {
    version: "1.16.2-pre2",
    stable: false,
  },
  {
    version: "1.16.2-pre1",
    stable: false,
  },
  {
    version: "20w30a",
    stable: false,
  },
  {
    version: "20w29a",
    stable: false,
  },
  {
    version: "20w28a",
    stable: false,
  },
  {
    version: "20w27a",
    stable: false,
  },
  {
    version: "1.16.1",
    stable: true,
  },
  {
    version: "1.16",
    stable: true,
  },
  {
    version: "1.16-rc1",
    stable: false,
  },
  {
    version: "1.16-pre8",
    stable: false,
  },
  {
    version: "1.16-pre7",
    stable: false,
  },
  {
    version: "1.16-pre6",
    stable: false,
  },
  {
    version: "1.16-pre5",
    stable: false,
  },
  {
    version: "1.16-pre4",
    stable: false,
  },
  {
    version: "1.16-pre3",
    stable: false,
  },
  {
    version: "1.16-pre2",
    stable: false,
  },
  {
    version: "1.16-pre1",
    stable: false,
  },
  {
    version: "20w22a",
    stable: false,
  },
  {
    version: "20w21a",
    stable: false,
  },
  {
    version: "20w20b",
    stable: false,
  },
  {
    version: "20w20a",
    stable: false,
  },
  {
    version: "20w19a",
    stable: false,
  },
  {
    version: "20w18a",
    stable: false,
  },
  {
    version: "20w17a",
    stable: false,
  },
  {
    version: "20w16a",
    stable: false,
  },
  {
    version: "20w15a",
    stable: false,
  },
  {
    version: "20w14a",
    stable: false,
  },
  {
    version: "20w14infinite",
    stable: false,
  },
  {
    version: "20w13b",
    stable: false,
  },
  {
    version: "20w13a",
    stable: false,
  },
  {
    version: "20w12a",
    stable: false,
  },
  {
    version: "20w11a",
    stable: false,
  },
  {
    version: "20w10a",
    stable: false,
  },
  {
    version: "20w09a",
    stable: false,
  },
  {
    version: "20w08a",
    stable: false,
  },
  {
    version: "20w07a",
    stable: false,
  },
  {
    version: "20w06a",
    stable: false,
  },
  {
    version: "1.15.2",
    stable: true,
  },
  {
    version: "1.15.2-pre2",
    stable: false,
  },
  {
    version: "1.15.2-pre1",
    stable: false,
  },
  {
    version: "1.15.1",
    stable: true,
  },
  {
    version: "1.15.1-pre1",
    stable: false,
  },
  {
    version: "1.15",
    stable: true,
  },
  {
    version: "1.15-pre7",
    stable: false,
  },
  {
    version: "1.15-pre6",
    stable: false,
  },
  {
    version: "1.15-pre5",
    stable: false,
  },
  {
    version: "1.15-pre4",
    stable: false,
  },
  {
    version: "1.15_combat-1",
    stable: false,
  },
  {
    version: "1.15-pre3",
    stable: false,
  },
  {
    version: "1.15-pre2",
    stable: false,
  },
  {
    version: "1.15-pre1",
    stable: false,
  },
  {
    version: "19w46b",
    stable: false,
  },
  {
    version: "19w46a",
    stable: false,
  },
  {
    version: "19w45b",
    stable: false,
  },
  {
    version: "19w45a",
    stable: false,
  },
  {
    version: "1.14_combat-3",
    stable: false,
  },
  {
    version: "19w44a",
    stable: false,
  },
  {
    version: "19w42a",
    stable: false,
  },
  {
    version: "19w41a",
    stable: false,
  },
  {
    version: "19w40a",
    stable: false,
  },
  {
    version: "19w39a",
    stable: false,
  },
  {
    version: "19w38b",
    stable: false,
  },
  {
    version: "19w38a",
    stable: false,
  },
  {
    version: "19w37a",
    stable: false,
  },
  {
    version: "19w36a",
    stable: false,
  },
  {
    version: "19w35a",
    stable: false,
  },
  {
    version: "19w34a",
    stable: false,
  },
  {
    version: "1.14_combat-0",
    stable: false,
  },
  {
    version: "1.14.4",
    stable: true,
  },
  {
    version: "1.14.4-pre7",
    stable: false,
  },
  {
    version: "1.14.4-pre6",
    stable: false,
  },
  {
    version: "1.14.4-pre5",
    stable: false,
  },
  {
    version: "1.14.4-pre4",
    stable: false,
  },
  {
    version: "1.14.4-pre3",
    stable: false,
  },
  {
    version: "1.14.4-pre2",
    stable: false,
  },
  {
    version: "1.14.4-pre1",
    stable: false,
  },
  {
    version: "1.14.3",
    stable: true,
  },
  {
    version: "1.14_combat-212796",
    stable: false,
  },
  {
    version: "1.14.3-pre4",
    stable: false,
  },
  {
    version: "1.14.3-pre3",
    stable: false,
  },
  {
    version: "1.14.3-pre2",
    stable: false,
  },
  {
    version: "1.14.3-pre1",
    stable: false,
  },
  {
    version: "1.14.2",
    stable: true,
  },
  {
    version: "1.14.2 Pre-Release 4",
    stable: false,
  },
  {
    version: "1.14.2 Pre-Release 3",
    stable: false,
  },
  {
    version: "1.14.2 Pre-Release 2",
    stable: false,
  },
  {
    version: "1.14.2 Pre-Release 1",
    stable: false,
  },
  {
    version: "1.14.1",
    stable: true,
  },
  {
    version: "1.14.1 Pre-Release 2",
    stable: false,
  },
  {
    version: "1.14.1 Pre-Release 1",
    stable: false,
  },
  {
    version: "1.14",
    stable: true,
  },
  {
    version: "1.14 Pre-Release 5",
    stable: false,
  },
  {
    version: "1.14 Pre-Release 4",
    stable: false,
  },
  {
    version: "1.14 Pre-Release 3",
    stable: false,
  },
  {
    version: "1.14 Pre-Release 2",
    stable: false,
  },
  {
    version: "1.14 Pre-Release 1",
    stable: false,
  },
  {
    version: "19w14b",
    stable: false,
  },
  {
    version: "19w14a",
    stable: false,
  },
  {
    version: "3D Shareware v1.34",
    stable: false,
  },
  {
    version: "19w13b",
    stable: false,
  },
  {
    version: "19w13a",
    stable: false,
  },
  {
    version: "19w12b",
    stable: false,
  },
  {
    version: "19w12a",
    stable: false,
  },
  {
    version: "19w11b",
    stable: false,
  },
  {
    version: "19w11a",
    stable: false,
  },
  {
    version: "19w09a",
    stable: false,
  },
  {
    version: "19w08b",
    stable: false,
  },
  {
    version: "19w08a",
    stable: false,
  },
  {
    version: "19w07a",
    stable: false,
  },
  {
    version: "19w06a",
    stable: false,
  },
  {
    version: "19w05a",
    stable: false,
  },
  {
    version: "19w04b",
    stable: false,
  },
  {
    version: "19w04a",
    stable: false,
  },
  {
    version: "19w03c",
    stable: false,
  },
  {
    version: "19w03b",
    stable: false,
  },
  {
    version: "19w03a",
    stable: false,
  },
  {
    version: "19w02a",
    stable: false,
  },
  {
    version: "18w50a",
    stable: false,
  },
  {
    version: "18w49a",
    stable: false,
  },
  {
    version: "18w48b",
    stable: false,
  },
  {
    version: "18w48a",
    stable: false,
  },
  {
    version: "18w47b",
    stable: false,
  },
  {
    version: "18w47a",
    stable: false,
  },
  {
    version: "18w46a",
    stable: false,
  },
  {
    version: "18w45a",
    stable: false,
  },
  {
    version: "18w44a",
    stable: false,
  },
  {
    version: "18w43c",
    stable: false,
  },
  {
    version: "18w43b",
    stable: false,
  },
];

// Filter for stable versions
const stableVersions = versions
  .filter((version) => version.stable)
  .map((version) => version.version);

// Print the array of stable versions
console.log(stableVersions);
