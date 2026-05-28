<div align="center">

```
 ██████╗  ██████╗ ██████╗      ██████╗ ██████╗ ███╗   ███╗██████╗ ██╗██╗     ███████╗██████╗
██╔════╝ ██╔═══██╗██╔══██╗    ██╔════╝██╔═══██╗████╗ ████║██╔══██╗██║██║     ██╔════╝██╔══██╗
██║  ███╗██║   ██║██║  ██║    ██║     ██║   ██║██╔████╔██║██████╔╝██║██║     █████╗  ██████╔╝
██║   ██║██║   ██║██║  ██║    ██║     ██║   ██║██║╚██╔╝██║██╔═══╝ ██║██║     ██╔══╝  ██╔══██╗
╚██████╔╝╚██████╔╝██████╔╝    ╚██████╗╚██████╔╝██║ ╚═╝ ██║██║     ██║███████╗███████╗██║  ██║
 ╚═════╝  ╚═════╝ ╚═════╝      ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝
```

**A high-performance, secure, real-time code execution engine**

[![Node.js](https://img.shields.io/badge/Node.js-Runtime-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![Express](https://img.shields.io/badge/Express-Framework-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-010101?style=flat-square&logo=socket.io)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
[![License: MIT](https://img.shields.io/badge/License-MIT-F5C518?style=flat-square)](LICENSE)

Run **C**, **C++**, **Python**, and **Rust** inside fully isolated Docker containers — with live streaming output and interactive stdin over WebSockets.

</div>

---

## Overview

God Compiler is a dual-mode code execution engine that offers a classic REST API for batch execution and a real-time WebSocket API for interactive, IDE-style sessions. Every execution runs inside a UUID-scoped workspace within Docker, with strict resource limits and automatic cleanup — keeping the host safe and the system stable under concurrent load.

---

## Features

- **Dual Execution Modes** — REST for simple request-response flows; WebSocket for interactive real-time sessions
- **Live Streaming** — stdout and stderr are emitted as they are produced, not buffered at the end
- **Interactive stdin** — pipe user input directly into a running process at any point during execution
- **Process Isolation** — each job runs in a dedicated UUID workspace; the entire process group is killed on termination
- **Configurable Constraints** — timeouts, output limits, and concurrency cap are all controlled via `.env`
- **Automatic Cleanup** — workspaces, binaries, and process handles are torn down on completion or disconnect

---

## Supported Languages

| Language | Compiler / Runtime |
|----------|--------------------|
| C        | `gcc`              |
| C++      | `g++`              |
| Python   | `python3`          |
| Rust     | `rustc`            |

---

## Tech Stack

| Layer                   | Technology              |
|-------------------------|-------------------------|
| Runtime                 | Node.js                 |
| HTTP Framework          | Express                 |
| Real-time Communication | `ws` (WebSockets)       |
| Containerization        | Docker                  |
| Process Management      | `child_process.spawn`   |
| Utilities               | UUID                    |

---

## Quick Start

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) and Docker Desktop must be installed.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/god-compiler.git
cd god-compiler
```

### 2. Configure Environment

Copy the example env file and adjust values as needed (see [Configuration](#configuration) below):

```bash
cp .env.example .env
```

### 3. Build the Docker Image

```bash
docker build -t god-compiler .
```

### 4. Run the Container

```bash
docker run -p 3000:3000 -v $(pwd):/app god-compiler
```

The server starts at `http://localhost:3000` (REST) and `ws://localhost:3000` (WebSocket).

---

## Configuration

All runtime parameters are controlled through environment variables. Create a `.env` file in the project root:

```env
# Server
PORT=3000
NODE_ENV=development

# Execution Limits
MAX_CODE_SIZE=10000
RUN_TIMEOUT=30000
MAX_EXECUTION_TIMEOUT=600000
MAX_CONCURRENT_EXECUTIONS=5

# Storage
TEMP_DIR=/tmp/executions

# Python (optional: set a custom Python executable path)
PYTHON_EXECUTABLE=
```

### Variable Reference

| Variable                   | Default              | Description                                                     |
|----------------------------|----------------------|-----------------------------------------------------------------|
| `PORT`                     | `3000`               | Port the HTTP and WebSocket server listens on                   |
| `NODE_ENV`                 | `development`        | Runtime environment (`development` / `production`)              |
| `MAX_CODE_SIZE`            | `10000`              | Maximum allowed source code size in characters                  |
| `TEMP_DIR`                 | System temp dir      | Directory where UUID execution workspaces are created           |
| `RUN_TIMEOUT`              | `30000` (30s)        | Per-execution run timeout in milliseconds                       |
| `MAX_EXECUTION_TIMEOUT`    | `600000` (10 min)    | Absolute upper bound for any single execution session           |
| `MAX_CONCURRENT_EXECUTIONS`| `5`                  | Max parallel jobs allowed across REST and WebSocket combined    |
| `PYTHON_EXECUTABLE`        | System `python3`     | Path to a custom Python binary (leave empty to use system default) |

> All limits apply globally across both REST and WebSocket execution modes.

---

## API Documentation

God Compiler exposes two independent execution interfaces. Full details for each are documented separately:

### REST API

> Stateless · Request-Response · Best for batch jobs and backend integrations

📄 **[View REST API Reference →](./rest.info.md)**

Covers:
- `GET /` — server status
- `GET /health` — container health check
- `POST /execute` — compile and run code, with response schemas for success, compilation error, and timeout

---

### WebSocket API

> Stateful · Real-time Streaming · Best for online IDEs and interactive shells

📄 **[View WebSocket API Reference →](./websocket.info.md)**

Covers:
- Connection and protocol format
- Full execution lifecycle: `execute` → `stdin` → streaming events → `exit`
- Manual process termination via `terminate`
- All error scenarios: compilation failure, timeout, output limit, invalid job ID

---

## Project Structure

```
.
├── src/
│   ├── execution/
│   │   ├── manager/      # LiveExecution & Process Registry
│   │   ├── runner/       # Interactive & Stream Runners
│   │   └── workspace/    # Workspace & Cleanup Managers
│   └── websocket/        # Handlers: stdin, terminate, gateway
├── .env.example
├── Dockerfile
└── README.md
```

---

## Security Model

- **Workspace Isolation** — every execution gets a unique UUID directory, preventing any cross-job file access
- **Process Group Termination** — processes are spawned with `detached: true`, so a single `SIGKILL` tears down the entire subprocess tree
- **Automatic Cleanup** — on job completion or unexpected WebSocket disconnect, workspaces are deleted and all resources are released immediately

---

## Contributing

Contributions, improvements, and issue reports are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a pull request

---

## Author

Built by **Shashikant**

---

## License

[MIT License](LICENSE)