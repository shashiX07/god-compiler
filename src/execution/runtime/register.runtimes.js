import {
  runtimeRegistry
} from "./runtime.registry.js";

import {
  CppRuntime
} from "../languages/cpp/cpp.runtime.js";
import { CRuntime } from "../languages/c/c.runtime.js";
import { PythonRuntime } from "../languages/python/python.runtime.js";
import { RustRuntime } from "../languages/rust/rust.runtime.js";
import { BashRuntime } from "../languages/bash/bash.runtime.js";

runtimeRegistry.register(
  "cpp",
  CppRuntime
);

runtimeRegistry.register(
  "c",
  CRuntime
);

runtimeRegistry.register(
    "python",
    PythonRuntime
);

runtimeRegistry.register(
  "rust",
  RustRuntime,
);

runtimeRegistry.register(
  "bash",
  BashRuntime,
);

runtimeRegistry.register(
  "sh",
  BashRuntime,
);
