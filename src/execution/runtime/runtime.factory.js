import "./register.runtimes.js";
import { runtimeRegistry } from "./runtime.registry.js";
import { normalizeLanguage } from "../languages/language.catalog.js";

export class RuntimeFactory {
  static create(language) {
    const normalized = normalizeLanguage(language);
    const Runtime = runtimeRegistry.get(normalized);
    if (!Runtime) {
      const supported = runtimeRegistry.list().join(", ");
      throw new Error(
        `No runtime found for language: ${language}. Supported: ${supported}`,
      );
    }
    return new Runtime();
  }
}
