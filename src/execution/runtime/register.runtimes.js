import {
  runtimeRegistry
} from "./runtime.registry.js";

import {
  CppRuntime
} from "../languages/cpp/cpp.runtime.js";
import { PythonRuntime } from "../languages/python/python.runtime.js";

runtimeRegistry.register(
  "cpp",
  CppRuntime
);

runtimeRegistry.register(
    "python",
    PythonRuntime
)