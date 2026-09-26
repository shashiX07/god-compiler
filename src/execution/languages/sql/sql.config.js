export const SQL_CONFIG = {
  language: "sql",
  sourceFile: "query.sql",
  playgroundFile: "sql.playground.py",
  executeCommand:
    process.env.PYTHON_EXECUTABLE ||
    (process.platform === "win32" ? "python" : "python3"),
};
