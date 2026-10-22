import fs from "fs/promises";
import path from "path";

const collectFiles = async (directory, rootDirectory = directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath, rootDirectory)));
      continue;
    }

    if (entry.isFile() && path.extname(entry.name).toLowerCase() === ".png") {
      files.push({
        name: path.relative(rootDirectory, entryPath).split(path.sep).join("/"),
        mimeType: "image/png",
        data: (await fs.readFile(entryPath)).toString("base64"),
      });
    }
  }

  return files;
};

export const collectPngArtifacts = (workspacePath) =>
  collectFiles(workspacePath);
