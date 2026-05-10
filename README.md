# 🚀 God Compiler

God Compiler is a high-performance, secure, and real-time code execution engine built with Node.js and Docker. It provides both REST-based execution and live-streaming WebSocket execution for compiling and running C++ programs in isolated environments.

---

# ✨ Features

* Dual execution modes:

  * REST API for standard request-response execution
  * WebSocket API for real-time streaming execution

* Real-time stdout and stderr streaming

* Secure isolated execution workspaces

* Automatic workspace cleanup after execution

* Output protection with a 1MB output limit

* Execution and compilation timeout protection

* Global concurrency control for server stability

* Fully Dockerized environment

---

# 🛠️ Tech Stack

| Component               | Technology                    |
| ----------------------- | ----------------------------- |
| Runtime                 | Node.js                       |
| Framework               | Express                       |
| Real-time Communication | ws (WebSockets)               |
| Compiler                | g++ (GCC)                     |
| Containerization        | Docker                        |
| Utilities               | UUID, Child Process (`spawn`) |

---

# 🚀 Quick Start

## 1. Prerequisites

Install the following:

* Docker
* Docker Desktop

---

## 2. Build Docker Image

```bash id="t9q4v1"
docker build -t god-compiler .
```

---

## 3. Run the Container

```bash id="n2j4x0"
docker run -p 3000:3000 -v $(pwd):/app god-compiler
```

---

# 📖 API Documentation

The project provides two execution interfaces.

## REST API

Traditional request-response execution model.

Suitable for:

* Batch execution
* One-off execution requests
* Backend integrations

- for more ino read : [RESTAPI Info](./rest.info.md)
---

## WebSocket API

Real-time streaming execution model.

Suitable for:

* Online IDEs
* Terminal-like experiences
* Interactive execution environments

- for more info read : [Websocket Info](./websocket.info.md)
---

# 🛡️ Security & Constraints

The execution engine enforces multiple safety mechanisms.

| Constraint          | Limit      |
| ------------------- | ---------- |
| Max Concurrent Jobs | 3          |
| Max Output Size     | 1MB        |
| Execution Timeout   | 5 Seconds  |
| Compilation Timeout | 10 Seconds |

---

# 🔒 Isolation Model

Each execution request:

1. Creates a unique UUID-based workspace
2. Compiles and executes inside the isolated workspace
3. Streams output safely
4. Terminates runaway processes using `SIGKILL`
5. Automatically deletes all temporary files

---

# 📂 Project Structure

```text id="b1f3uy"
.
├── src/
├── docker/
├── tmp/
├── package.json
├── Dockerfile
└── README.md
```

---

# ⚡ Supported Execution Modes

| Mode      | Description                                 |
| --------- | ------------------------------------------- |
| REST      | Blocking execution with final JSON response |
| WebSocket | Live execution with streamed events         |

---

# 🧪 Example REST Request

```bash id="ehv9bw"
curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{"language":"cpp","code":"#include<iostream>\nint main(){std::cout<<\"Hello\";}"}'
```

---

# 📡 Example WebSocket Connection

```text id="vq8dnn"
ws://localhost:3000
```

---

# 🤝 Contributing

Contributions, improvements, and issue reports are welcome.

You can:

* Fork the repository
* Open pull requests
* Report bugs
* Suggest new features

---

# 👨‍💻 Author

Shashikant

---

# 📄 License

MIT License
