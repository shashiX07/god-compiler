export const PYTHON_CONFIG = {

  language: "python",

  sourceFile: "main.py",

  bootstrapFile: "__runner_bootstrap__.py",

  executeCommand:
    process.env.PYTHON_EXECUTABLE ||
    (process.platform === "win32" ? "python" : "python3")

};
