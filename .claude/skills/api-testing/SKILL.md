---
name: api-testing
description: Perform manual testing automatically to ensure there is no regression after implementation.
---

This document describes the generic workflow for Claude Code to perform manual API testing (inside `api` folder).

## Setup

### Step 1: Kill Existing Processes

```bash
cd .. && make kill
```

This ensures port 3456 is available.

### Step 2: Start the API

Start the API with an isolated data directory to avoid affecting the user's instance:

```bash
cd api && KALAMARI_DATA_DIR=/tmp/kalamari-test-$(date +%s) npm start &
```

Wait a few seconds for the server to be ready, then verify:

```bash
curl -s http://localhost:3456/api/health | head -c 100
```

## Testing Guidelines

### Use Subagents for Parallel Testing

Always spawn subagents to run tests. This keeps the main conversation clean and enables parallel execution.

- Spawn **one subagent per test case** for independent tests
- Spawn **one subagent for a test sequence** when tests depend on each other (e.g., create → update → delete)
- Run multiple subagents in parallel to reduce total testing time

### Use curl for API Requests

Always use curl with proper headers:

```bash
# GET request
curl http://localhost:3456/api/{endpoint}

# POST request with JSON body
curl -X POST http://localhost:3456/api/{endpoint} \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'

# PATCH request
curl -X PATCH http://localhost:3456/api/{endpoint} \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'

# DELETE request
curl -X DELETE http://localhost:3456/api/{endpoint}
```

### Wait for Async Processing

When testing features that involve background processing (e.g., queue processors), wait before checking results:

```bash
sleep 3  # Wait for processor to complete
```

### Chain Dependent Requests

Save IDs from responses to use in subsequent requests:

```bash
# Create resource and extract ID
WORKSPACE_ID=$(curl -s -X POST http://localhost:3456/api/workspaces \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}' | jq -r '.id')

# Use ID in next request
curl http://localhost:3456/api/workspaces/$WORKSPACE_ID
```

## Cleanup

After testing, stop the background server:

```bash
cd .. && make kill
```

## Test Cases

### Workspaces API

#### Create Workspace
```bash
curl -s -X POST http://localhost:3456/api/workspaces \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Workspace", "description": "A test workspace"}'
```
**Expected:** Returns workspace object with `id`, `name`, `description`

#### List Workspaces
```bash
curl -s http://localhost:3456/api/workspaces
```
**Expected:** Returns paginated list with `data` array and `meta` object

#### Get Workspace
```bash
curl -s http://localhost:3456/api/workspaces/{WORKSPACE_ID}
```
**Expected:** Returns workspace object

#### Update Workspace
```bash
curl -s -X PATCH http://localhost:3456/api/workspaces/{WORKSPACE_ID} \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name", "workingDirectory": "/tmp/project"}'
```
**Expected:** Returns updated workspace object

#### Delete Workspace
```bash
curl -s -X DELETE http://localhost:3456/api/workspaces/{WORKSPACE_ID}
```
**Expected:** Returns 200 OK

---

### Chats API

#### Create Chat
```bash
curl -s -X POST http://localhost:3456/api/workspaces/{WORKSPACE_ID}/chats
```
**Expected:** Returns chat object with `id`, `workspaceId`, `name`, `isProcessing: false`

#### List Chats
```bash
curl -s "http://localhost:3456/api/chats?workspace_id={WORKSPACE_ID}"
```
**Expected:** Returns paginated list of chats

#### Get Chat
```bash
curl -s http://localhost:3456/api/chats/{CHAT_ID}
```
**Expected:** Returns chat object with `isProcessing` status

#### Update Chat
```bash
curl -s -X PATCH http://localhost:3456/api/chats/{CHAT_ID} \
  -H "Content-Type: application/json" \
  -d '{"name": "My Chat"}'
```
**Expected:** Returns updated chat object

#### Delete Chat
```bash
curl -s -X DELETE http://localhost:3456/api/chats/{CHAT_ID}
```
**Expected:** Returns 200 OK

---

### Chat Messages API

#### Send Message
```bash
curl -s -X POST http://localhost:3456/api/chats/{CHAT_ID}/messages \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, can you help me?"}'
```
**Expected:** Returns message object with `actorType: "user"`

#### List Messages
```bash
curl -s http://localhost:3456/api/chats/{CHAT_ID}/messages
```
**Expected:** Returns paginated list of messages

---

### ChatQueueProcessor Tests

#### Test 1: Basic Agent Response
1. Create workspace and chat
2. Send a message
3. Wait 5 seconds
4. List messages

**Expected:** Should see both user message and agent response

#### Test 2: Conversation Memory
1. Send: `"My name is Alex and I am working on a TypeScript project"`
2. Wait 3 seconds
3. Send: `"What is my name and what kind of project am I working on?"`
4. Wait 3 seconds
5. List messages

**Expected:** Agent should respond with "Alex" and "TypeScript project"

#### Test 3: Workspace Context
1. Update workspace description: `"This is a Python ML project using TensorFlow"`
2. Send: `"What is this project about?"`
3. Wait 3 seconds
4. List messages

**Expected:** Agent should mention Python, ML, TensorFlow from workspace description

#### Test 4: Working Directory
1. Create test files:
   ```bash
   mkdir -p /tmp/test-project
   echo "# README" > /tmp/test-project/README.md
   echo "print('hello')" > /tmp/test-project/main.py
   ```
2. Update workspace: `{"workingDirectory": "/tmp/test-project"}`
3. Send: `"What files are in this project?"`
4. Wait 5 seconds
5. List messages

**Expected:** Agent should list README.md and main.py

#### Test 5: Cancel Processing
1. Send a message
2. Immediately call cancel:
   ```bash
   curl -s -X POST http://localhost:3456/api/chats/{CHAT_ID}/cancel
   ```

**Expected:** Returns chat with `isProcessing: false`
