# God Compiler WebSocket API Guide

## Connection Details

* **URL:** `ws://localhost:3000`
* **Protocol:** Standard WebSocket
* **Transport:** JSON messages

---

# Message Format

All communication uses JSON objects with an `event` field.

---

# Client → Server

## Execute Code

```json
{
  "event": "execute",
  "language": "cpp",
  "code": "#include <iostream>\nint main() { return 0; }"
}
```

### Fields

| Field      | Type   | Description          |
| ---------- | ------ | -------------------- |
| `event`    | string | Must be `"execute"`  |
| `language` | string | Programming language |
| `code`     | string | Source code          |

---

# Server → Client Events

| Event    | Description              |
| -------- | ------------------------ |
| `status` | Execution status updates |
| `stdout` | Standard output          |
| `stderr` | Error output             |
| `exit`   | Final execution result   |
| `error`  | Internal/server errors   |

---

# Successful Execution

## Request

```json
{
  "event": "execute",
  "language": "cpp",
  "code": "#include <iostream>\nint main() { std::cout << \"Hello Shashi\"; return 0; }"
}
```

## Response Stream

```json
{
  "event": "status",
  "data": "Compiling..."
}
```

```json
{
  "event": "status",
  "data": "Compilation completed. Executing..."
}
```

```json
{
  "event": "stdout",
  "data": "Hello Shashi"
}
```

```json
{
  "event": "exit",
  "exitCode": 0
}
```

---

# Compilation Failure

## Request

```json
{
  "event": "execute",
  "language": "cpp",
  "code": "int main() { std::cout << \"Broken\" }"
}
```

## Response

```json
{
  "event": "status",
  "data": "Compiling..."
}
```

```json
{
  "event": "exit",
  "data": {
    "success": false,
    "phase": "compilation",
    "stderr": "error: expected ';' before '}' token"
  }
}
```

---

# Execution Timeout

## Request

```json
{
  "event": "execute",
  "language": "cpp",
  "code": "int main() { while(true); }"
}
```

## Response

```json
{
  "event": "exit",
  "data": {
    "success": false,
    "timeout": true,
    "message": "Execution Timeout: Process killed..."
  }
}
```

---

# Output Limit Protection

## Request

```json
{
  "event": "execute",
  "language": "cpp",
  "code": "#include <iostream>\nint main() { while(true) std::cout << \"SPAM\"; }"
}
```

## Behavior

* Process is terminated when output exceeds `1MB`
* Connection remains alive
* Server emits an `exit` event with an error message

---

# System Constraints

## Concurrency

Maximum concurrent executions:

```text
3
```

If the server is busy:

```json
{
  "success": false,
  "message": "Server is busy. You are in the queue. Please wait for your turn."
}
```

---

# Time Limits

| Phase       | Limit |
| ----------- | ----- |
| Compilation | 10s   |
| Execution   | 5s    |

Configured via:

```text
EXECUTION_CONSTANTS
```

---

# Implementation Notes

## Socket Registry

Each connection receives a unique `socketID`.

Managed internally using:

```text
SocketRegistry
```

---

## Cleanup

Temporary workspaces are automatically deleted after execution:

* Success
* Compilation failure
* Runtime failure
* Timeout

---

# Security

The system uses `SIGKILL` to terminate runaway processes immediately.
