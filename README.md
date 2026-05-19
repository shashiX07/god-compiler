# 🚀 God Compiler

God Compiler is a high-performance, secure, and real-time code execution engine built with Node.js and Docker. It provides both REST and WebSocket execution interfaces for running code inside isolated, resource-constrained environments.

Supported runtimes today:

- C
- C++
- Python
- Rust

---

# ✨ Features

## Dual Execution Modes

### REST API

Stateless request-response execution model designed for batch jobs and one-off executions.

### WebSocket API

Stateful interactive execution model with real-time streaming and stdin support.

---

## Interactive Terminal Support

- Full bidirectional stdin support
- Real-time user input handling
- Interactive terminal-like execution sessions

---

## Persistent Execution Sessions

- Socket-to-process mapping
- Long-running interactive session management
- Job-based execution tracking using `jobId`

---

## Real-Time Streaming

- Live stdout streaming
- Live stderr streaming
- Instant execution feedback

---

## Secure Isolation

- UUID-based isolated workspaces
- Automatic temporary workspace cleanup
- Process-group level termination

---

## Resource Protection

- Output buffer limit: `1MB`
- Execution timeout: `5 seconds`
- Compilation timeout: `10 seconds`

---

## Concurrency Control

Built-in concurrency guard to maintain stability under heavy load.

---

## Manual Process Termination

Supports killing running executions manually using a `jobId`.

---

# 🛠️ Tech Stack

| Component               | Technology                    |
| ----------------------- | ----------------------------- |
| Runtime                 | Node.js                       |
| Framework               | Express                       |
| Real-time Communication | ws (WebSockets)               |
| Compiler                | g++, rustc, python3          |
| Containerization        | Docker                        |
| Utilities               | UUID, Child Process (`spawn`) |

---

# 🚀 Quick Start

---

# 1. Prerequisites

Install the following dependencies:

- Docker
- Docker Desktop

---

# 2. Build Docker Image

```bash id="3yzdfg"
docker build -t god-compiler .
```

---

# 3. Run Docker Container

```bash id="4jx69u"
docker run -p 3000:3000 -v $(pwd):/app god-compiler
```

---

# 📖 API Documentation

---

# REST API

Traditional blocking execution model.

Best suited for:

- Batch execution
- Script execution
- Backend integrations

## Documentation

```md id="w70q2y"
[REST API Info](./rest.info.md)
```

---

# WebSocket API

Interactive stateful execution model.

Best suited for:

- Online IDEs
- Remote shells
- Interactive execution sessions

## Documentation

```md id="39enls"
[WebSocket Info](./websocket.info.md)
```

---

# 🛡️ Security & Constraints

| Constraint          | Limit      |
| ------------------- | ---------- |
| Max Concurrent Jobs | 3          |
| Max Output Size     | 1MB        |
| Execution Timeout   | 5 Seconds  |
| Compilation Timeout | 10 Seconds |

---

# 🔒 Isolation & Interactive Execution Model

---

## Workspace Isolation

Every execution request creates a unique UUID-based workspace directory.

---

## Persistent Session Registry

Interactive jobs are stored inside a Process Registry for:

- stdin routing
- process lifecycle management
- session tracking

---

## stdin Piping

User input is dynamically piped into the running process through the standard input stream.

---

## Cleanup & Termination

When execution ends or a connection closes:

1. `SIGKILL` is sent to the entire process group
2. All subprocesses are terminated
3. Temporary workspace directories are deleted

---

# 📂 Project Structure

```text id="pgsn9d"
.
├── src/
│   ├── execution/
│   │   ├── manager/      # LiveExecution & Process Registry
│   │   ├── runner/       # Interactive & Stream Runners
│   │   └── workspace/    # Workspace & Cleanup Managers
│   └── websocket/        # Handlers (stdin, terminate, gateway)
├── Dockerfile
└── README.md
```

---

# 🤝 Contributing

Contributions, improvements, and issue reports are welcome.

Feel free to:

- Fork the repository
- Open pull requests
- Report issues
- Suggest improvements

---

# 👨‍💻 Author

Shashikant

---

# 📄 License

MIT License
