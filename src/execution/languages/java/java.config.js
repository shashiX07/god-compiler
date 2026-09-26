export const JAVA_CONFIG = {
  language: "java",
  defaultClassName: "Main",
  compileCommand: "javac",
  executeCommand: "java",
  compileTimeout: 25000,
};

export function extractJavaPublicClass(code) {
  const match = String(code ?? "").match(/public\s+class\s+([A-Za-z_]\w*)/);
  return match?.[1] ?? JAVA_CONFIG.defaultClassName;
}
