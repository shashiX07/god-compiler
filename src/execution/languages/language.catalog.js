export const LANGUAGE_ALIASES = {
  "c++": "cpp",
  js: "javascript",
  node: "javascript",
  nodejs: "javascript",
  ts: "typescript",
  "c#": "csharp",
  cs: "csharp",
  py: "python",
  rs: "rust",
  rb: "ruby",
  kt: "kotlin",
  kts: "kotlin",
  golang: "go",
  sqlite: "sql",
  sqlite3: "sql",
  shell: "bash",
  zsh: "bash",
};

export function normalizeLanguage(language) {
  const key = String(language ?? "")
    .trim()
    .toLowerCase();
  return LANGUAGE_ALIASES[key] ?? key;
}

export const SUPPORTED_LANGUAGE_IDS = [
  "bash",
  "c",
  "cpp",
  "csharp",
  "go",
  "java",
  "javascript",
  "kotlin",
  "php",
  "python",
  "ruby",
  "rust",
  "sh",
  "sql",
  "swift",
  "typescript",
];
