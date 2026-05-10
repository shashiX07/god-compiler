import "./register.runtimes.js";
import { runtimeRegistry } from "./runtime.registry.js";
export class RuntimeFactory {
    static create(language) {
        const Runtime = runtimeRegistry.get(language);
        if (!Runtime) {
            throw new Error(`No runtime found for language: ${language}`);
        }
        return new Runtime();
    }
}
