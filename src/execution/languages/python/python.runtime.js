import path from "path";
import fs from "fs/promises";

import { BaseRuntime } from "../../runtime/runtime.types.js";
import { interactiveRunner } from "../../runner/interactive.runner.js";
import { PYTHON_CONFIG } from "./python.config.js";

const PYTHON_BOOTSTRAP = `import builtins
import os
import runpy
import socket
import subprocess
import sys

BLOCKED_MODULES = {
    "requests",
    "urllib",
    "urllib3",
    "httpx",
    "aiohttp",
    "ftplib",
    "telnetlib",
    "webbrowser",
}

_real_import = builtins.__import__

def _guarded_import(name, globals=None, locals=None, fromlist=(), level=0):
    root = name.split(".")[0]
    if root in BLOCKED_MODULES:
        raise ImportError(
            f"Import of '{root}' is disabled in this learning runtime. "
            "External network libraries are blocked for safety."
        )
    return _real_import(name, globals, locals, fromlist, level)

builtins.__import__ = _guarded_import

def _deny_network(*args, **kwargs):
    raise RuntimeError(
        "Network access is disabled in this runtime. "
        "Use offline libraries such as numpy and other approved learning packages."
    )

def _deny_process_spawn(*args, **kwargs):
    raise RuntimeError(
        "Spawning subprocesses is disabled in this runtime."
    )

socket.socket = _deny_network
socket.create_connection = _deny_network
socket.getaddrinfo = _deny_network
socket.gethostbyname = _deny_network
socket.gethostbyname_ex = _deny_network
socket.gethostname = lambda: "localhost"

os.system = _deny_process_spawn
os.popen = _deny_process_spawn
subprocess.Popen = _deny_process_spawn
subprocess.run = _deny_process_spawn
subprocess.call = _deny_process_spawn
subprocess.check_call = _deny_process_spawn
subprocess.check_output = _deny_process_spawn

os.environ.setdefault("MPLBACKEND", "Agg")

target = sys.argv[1]
sys.argv = sys.argv[1:]
runpy.run_path(target, run_name="__main__")
`;

export class PythonRuntime extends BaseRuntime {
  async prepare(context) {
    const sourcePath = path.join(
      context.workspacePath,
      PYTHON_CONFIG.sourceFile,
    );
    const bootstrapPath = path.join(
      context.workspacePath,
      PYTHON_CONFIG.bootstrapFile,
    );

    await fs.writeFile(sourcePath, context.code, "utf8");
    await fs.writeFile(bootstrapPath, PYTHON_BOOTSTRAP, "utf8");
  }

  async compile() {
    return {
      success: true,
    };
  }

  async execute(context) {
    return interactiveRunner(
      context.jobId,
      PYTHON_CONFIG.executeCommand,
      context.workspacePath,
      context.socket,
      [PYTHON_CONFIG.bootstrapFile, PYTHON_CONFIG.sourceFile],
      {
        env: {
          MPLBACKEND: "Agg",
        },
      },
    );
  }
}
