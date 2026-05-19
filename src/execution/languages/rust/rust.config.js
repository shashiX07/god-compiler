export const RUST_CONFIG = {
  language: "rust",
  sourceFile: "main.rs",
  outputFile: process.platform === "win32" ? "main.exe" : "main",
  compileCommand: "rustc",
};
