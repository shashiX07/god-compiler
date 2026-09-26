export const GO_CONFIG = {
  language: "go",
  sourceFile: "main.go",
  moduleFile: "go.mod",
  outputFile: process.platform === "win32" ? "main.exe" : "main",
  compileCommand: "go",
  compileTimeout: 25000,
  moduleSource: "module playground\n\ngo 1.21\n",
};
