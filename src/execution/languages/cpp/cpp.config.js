export const CPP_CONFIG = {

  language: "cpp",

  sourceFile: "main.cpp",

  outputFile: process.platform === "win32" ? "main.exe" : "main",

  compileCommand: "g++"

};
