import { runtimeRegistry } from "./runtime.registry.js";

import { CppRuntime } from "../languages/cpp/cpp.runtime.js";
import { CRuntime } from "../languages/c/c.runtime.js";
import { PythonRuntime } from "../languages/python/python.runtime.js";
import { RustRuntime } from "../languages/rust/rust.runtime.js";
import { BashRuntime } from "../languages/bash/bash.runtime.js";
import { JavaScriptRuntime } from "../languages/javascript/javascript.runtime.js";
import { TypeScriptRuntime } from "../languages/typescript/typescript.runtime.js";
import { JavaRuntime } from "../languages/java/java.runtime.js";
import { GoRuntime } from "../languages/go/go.runtime.js";
import { CSharpRuntime } from "../languages/csharp/csharp.runtime.js";
import { KotlinRuntime } from "../languages/kotlin/kotlin.runtime.js";
import { PhpRuntime } from "../languages/php/php.runtime.js";
import { RubyRuntime } from "../languages/ruby/ruby.runtime.js";
import { SwiftRuntime } from "../languages/swift/swift.runtime.js";
import { SqlRuntime } from "../languages/sql/sql.runtime.js";

const registrations = {
  cpp: CppRuntime,
  c: CRuntime,
  python: PythonRuntime,
  rust: RustRuntime,
  bash: BashRuntime,
  sh: BashRuntime,
  javascript: JavaScriptRuntime,
  typescript: TypeScriptRuntime,
  java: JavaRuntime,
  go: GoRuntime,
  csharp: CSharpRuntime,
  kotlin: KotlinRuntime,
  php: PhpRuntime,
  ruby: RubyRuntime,
  swift: SwiftRuntime,
  sql: SqlRuntime,
};

for (const [language, Runtime] of Object.entries(registrations)) {
  runtimeRegistry.register(language, Runtime);
}
