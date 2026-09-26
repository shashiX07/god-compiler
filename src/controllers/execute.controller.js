import { ExecutionManager } from "../execution/manager/execution.manager.js";
import { runtimeRegistry } from "../execution/runtime/runtime.registry.js";
import { normalizeLanguage } from "../execution/languages/language.catalog.js";
import "../execution/runtime/register.runtimes.js";

export const executeCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Code is required",
      });
    }

    if (!language) {
      return res.status(400).json({
        success: false,
        message: "Language is required",
      });
    }

    const normalized = normalizeLanguage(language);
    if (!runtimeRegistry.get(normalized)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported language: ${language}`,
        supported: runtimeRegistry.list(),
      });
    }

    const result = await ExecutionManager.execute(code, normalized);

    if (result?.success === false && result?.phase === "prepare") {
      return res.status(400).json({
        success: false,
        message: result.message,
        supported: runtimeRegistry.list(),
      });
    }

    return res.json({
      success: result?.success !== false,
      result,
    });
  } catch (error) {
    console.error("Error executing code:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while executing code",
    });
  }
};

export const listLanguages = (_req, res) => {
  return res.json({
    success: true,
    languages: runtimeRegistry.list(),
  });
};
