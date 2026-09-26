export const SWIFT_CONFIG = {
  language: "swift",
  sourceFile: "main.swift",
  outputFile: process.platform === "win32" ? "main.exe" : "main",
  compileCommand: "swiftc",
  compileTimeout: 30000,
};
