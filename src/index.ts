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

  const targetPlatform = core.getInput("target-platform");

  let cachedPath = tc.find("sd", version);
  if (!cachedPath) {
    const url = `https://github.com/chmln/sd/releases/download/v${version}/sd-v${version}-${targetPlatform}`;
    const binPath = await tc.downloadTool(url);
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
