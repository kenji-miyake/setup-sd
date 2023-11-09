import { exec } from "child_process";

import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import { Octokit } from "@octokit/rest";

async function main() {
  const octokit = new Octokit({ auth: core.getInput("token") });

  let version = core.getInput("version");
  if (version === "latest") {
    const latestRelease = await octokit.repos.getLatestRelease({
      owner: "chmln",
      repo: "sd",
    });
    version = latestRelease.data.tag_name.replace("v", "");
  }
  const isVersionPreVersion1 = version.startsWith("0.");

  const targetPlatform = core.getInput("target-platform");

  let cachedPath = tc.find("sd", version);
  if (!cachedPath) {
    let url = `https://github.com/chmln/sd/releases/download/v${version}/sd-v${version}-${targetPlatform}`;

    // sd began adding a file extension starting on version v1.0.0
    // Add the file extension unless the version is < v1.0.0
    if (!isVersionPreVersion1) {
      url += ".tar.gz";
    }

    let binPath = await tc.downloadTool(url);

    // Because we downloaded a .tar.gz, we must extract it and then find the sd binary file within the extracted directory
    if (!isVersionPreVersion1) {
      const extractedTarDestination = await tc.extractTar(binPath);

      // Update binPath to point to the sd binary file within the extracted directory
      binPath = `${extractedTarDestination}/sd-v${version}-${targetPlatform}/sd`;
    }

    cachedPath = await tc.cacheFile(binPath, "sd", "sd", version);
  }

  await exec(`chmod +x ${cachedPath}/sd`);
  core.addPath(cachedPath);
}

try {
  main();
} catch (error) {
  if (error instanceof Error) {
    core.setFailed(error.message);
  }
}
