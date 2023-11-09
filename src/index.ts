import * as path from "path";

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
    const url = `https://github.com/chmln/sd/releases/download/v${version}/sd-v${version}-${targetPlatform}.tar.gz`;
    const tarPath = await tc.downloadTool(url);
    const extractedFolder = await tc.extractTar(tarPath, "/tmp/sd");
    const binFolder = path.join(extractedFolder, `sd-v${version}-${targetPlatform}/sd`);
    cachedPath = await tc.cacheDir(binFolder, "sd", version);
  }
  core.addPath(cachedPath);
}

try {
  main();
} catch (error) {
  if (error instanceof Error) {
    core.setFailed(error.message);
  }
}
