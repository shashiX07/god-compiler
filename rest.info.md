# God Compiler REST API Reference

## Base URL

```text id="vpxqf0"
http://localhost:3000
```

---

# API Endpoints

---

## 1. Root / Welcome

Checks whether the API server is online.

### Endpoint

```http id="1zxw3s"
GET /
```

### Response

```json id="drg6h5"
{
  "success": true,
  "message": "Welcome to God Compiler API"
}
```

---

## 2. Health Check

Used for monitoring server/container health.

### Endpoint

```http id="z6tqmu"
GET /health
```

### Response

```json id="o79j2m"
{
  "success": true,
  "message": "Server is healthy"
}
```

---

## 3. Execute Code

Compiles and executes code using a standard request-response workflow.

### Endpoint

```http id="z7b5mo"
POST /execute
```

### Content-Type

```text id="olh7yh"
application/json
```

### Request Payload

```json id="4u2d6x"
{
  "language": "cpp",
  "code": "#include<iostream>\nint main(){std::cout<<\"Hello\";}"
}
```

---

# Request Fields

| Field      | Type   | Required | Description                        |
| ---------- | ------ | -------- | ---------------------------------- |
| `language` | string | Yes      | Programming language               |
| `code`     | string | Yes      | Source code to compile and execute |

---

# Response Structure

---

## Successful Execution

Returned when compilation and execution complete successfully.

```json id="p6k7mh"
{
  "success": true,
  "result": {
    "success": true,
    "phase": "execution",
    "stdout": "Hello",
    "stderr": "",
    "exitCode": 0
  }
}
```

---

## Compilation Error

Returned when source code contains syntax or compilation errors.

```json id="azlnck"
{
  "success": false,
  "message": "Error during code execution",
  "phase": "compilation",
  "stderr": "error: expected ';' before '}' token"
}
```

---

## Execution Timeout

Returned when execution exceeds the configured runtime limit.

```json id="vzyo4t"
{
  "success": true,
  "result": {
    "success": false,
    "phase": "execution",
    "timeout": true,
    "stdout": "",
    "stderr": "Execution Timeout: Process killed",
    "exitCode": null
  }
}
```

---

# Error Status Codes

| Status Code | Meaning               | Reason                               |
| ----------- | --------------------- | ------------------------------------ |
| `200`       | OK                    | Request processed successfully       |
| `400`       | Bad Request           | Missing code or unsupported language |
| `500`       | Internal Server Error | Internal server failure              |

---

# Security & Isolation

## Unique Workspaces

Each execution request creates a unique UUID workspace inside:

```text id="gmq8u2"
/tmp/executions
```

---

## Concurrency Guard

Maximum concurrent executions:

```text id="ic2ok9"
3
```

This limit applies globally across both REST and WebSocket executions.

---

## Automatic Cleanup

Temporary files are deleted automatically after execution:

* Source files
* Compiled binaries
* Temporary workspaces

Cleanup occurs regardless of:

* Success
* Compilation failure
* Runtime failure
* Timeout

---

# REST vs WebSocket

| Feature         | REST (`POST /execute`) | WebSocket (`ws://`) |
| --------------- | ---------------------- | ------------------- |
| Feedback        | Final response only    | Real-time streaming |
| Connection      | Per request            | Persistent          |
| Use Case        | Batch execution        | Interactive IDE     |
| Output Handling | Kills after 1MB        | Streams until 1MB   |

---

# Testing with curl

```bash id="cf0i1n"
curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{"language":"cpp","code":"#include<iostream>\nint main(){std::cout<<\"Rest Test\";}"}'
```
