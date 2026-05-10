# 🚀 God Compiler WebSocket API Guide

The God Compiler WebSocket API provides real-time code execution with interactive stdin support, live stdout/stderr streaming, and manual process control.

---

# 1. Connection & Protocol

## WebSocket URL

```text id="zrmzfq"
ws://localhost:3000
```

---

## Communication Format

All messages must be JSON-stringified objects.

---

## Heartbeat

Connection health is maintained using the standard WebSocket ping/pong mechanism.

---

# 2. Execution Lifecycle

---

# Step A — Execute Code

Starts a new execution session.

## Client Request

```json id="qvh9vd"
{
  "event": "execute",
  "language": "cpp",
  "code": "#include <iostream>\nint main() { int x; std::cin >> x; std::cout << x * 2; return 0; }"
}
```

---

## Server Response

The server immediately returns a unique `jobId`.

This `jobId` is required for:

* stdin interaction
* manual termination
* process tracking

```json id="szgg0k"
{
  "event": "started",
  "jobId": "8f153111-208c-4354-99af-2f202369b61a"
}
```

---

# Step B — Send stdin Input

Allows clients to send input to a running process.

> Always include `\n` to simulate pressing the Enter key.

---

## Client Request

```json id="y49z7e"
{
  "event": "stdin",
  "jobId": "8f153111-208c-4354-99af-2f202369b61a",
  "data": "5\n"
}
```

---

# Step C — Receive Server Events

The server streams execution updates in real time.

| Event    | Description                         |
| -------- | ----------------------------------- |
| `status` | Execution phase updates             |
| `stdout` | Real-time standard output           |
| `stderr` | Runtime errors or compiler warnings |
| `exit`   | Final execution result              |

---

# 3. Event Examples

---

## Status Event

```json id="w0a0s5"
{
  "event": "status",
  "data": "Compiling..."
}
```

---

## stdout Event

```json id="9zttki"
{
  "event": "stdout",
  "data": "10"
}
```

---

## stderr Event

```json id="v1k81l"
{
  "event": "stderr",
  "data": "Segmentation fault"
}
```

---

## exit Event

```json id="i8v8c7"
{
  "event": "exit",
  "exitCode": 0
}
```

---

# 4. Failure Scenarios & Edge Cases

---

# ❌ Compilation Failure

If source code contains syntax errors, execution never starts.

## Event

```json id="g9gflw"
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

# ❌ Execution Timeout

If execution exceeds the configured runtime limit, the server forcefully terminates the process group using `SIGKILL`.

## Events

* `error`
* `exit`

## Example

```json id="2y1gq9"
{
  "event": "error",
  "data": "Execution timeout"
}
```

---

# ❌ Output Limit Exceeded

If stdout exceeds `1MB`, execution is terminated automatically.

## Event

```json id="z32mva"
{
  "event": "exit",
  "data": {
    "success": false,
    "message": "Execution terminated: Output limit exceeded"
  }
}
```

---

# ❌ Invalid Job ID

Occurs when stdin is sent to a non-existent or completed process.

## Event

```json id="0g8s70"
{
  "event": "error",
  "data": "No active process found for the given job ID"
}
```

---

# 5. Manual Process Termination

Clients can manually terminate running processes.

Useful for:

* Stop buttons
* Cancelling long-running jobs
* Resetting execution sessions

---

## Client Request

```json id="ywffxk"
{
  "event": "terminate",
  "jobId": "8f153111-208c-4354-99af-2f202369b61a"
}
```

---

# 🛡️ System Constraints

| Metric              | Limit           |
| ------------------- | --------------- |
| Concurrency         | 3 Parallel Jobs |
| Compilation Timeout | 10 Seconds      |
| Execution Timeout   | 5 Seconds       |
| Output Buffer Limit | 1MB             |

---

# 💡 Implementation Notes

---

## Process Isolation

Each execution runs inside a unique UUID-based workspace directory.

---

## Group Process Termination

Processes are spawned using:

```text id="5uqp5f"
detached: true
```

This allows the server to terminate:

* the main process
* all child processes
* spawned subprocess trees

using a single `SIGKILL`.

---

## Automatic Cleanup

If a WebSocket connection closes unexpectedly:

* running processes are terminated
* temporary workspaces are deleted
* allocated resources are released automatically

---

# 📡 Typical Client Workflow

```text id="eym7z7"
1. Connect to WebSocket server
2. Send execute event
3. Receive started event with jobId
4. Stream stdout/stderr events
5. Send stdin events if required
6. Receive final exit event
7. Optionally terminate manually
```
