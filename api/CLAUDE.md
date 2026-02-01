# api

**Kalamari** is a NestJS-based TypeScript API with AI chat capabilities.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: NestJS 11.0.1
- **Language**: TypeScript 5.7.3 (ES2023)
- **Database**: SQLite with TypeORM 0.3.28
- **Validation**: class-validator, class-transformer
- **Testing**: Jest 30.0.0, Supertest 7.0.0
- **Code Quality**: ESLint 9.18.0, Prettier 3.4.2

## Project Structure

```
src/
├── main.ts              # Application bootstrap
├── app.module.ts        # Root module
├── core/                # Core infrastructure
│   ├── config/          # App configuration
│   ├── entities/        # TypeORM database entities
│   ├── modules/         # Shared modules (TypeORM, EventEmitter, Config)
│   ├── services/        # Shared services (DirService)
│   └── dtos/            # Shared DTOs (pagination)
├── chat/                # Chat feature module
│   ├── controllers/     # Chat & message endpoints
│   ├── services/        # Business logic
│   ├── processors/      # Event-driven queue processing
│   ├── agent-actions/   # AI action handlers
│   ├── templates/       # Prompt templates
│   ├── types/           # TypeScript types
│   └── dtos/            # Request/response DTOs
├── workspace/           # Workspace management
│   ├── controllers/     # CRUD endpoints
│   ├── services/        # Business logic
│   └── dtos/            # Request/response DTOs
├── cli/                 # AI CLI adapters
│   ├── adapters/        # Claude, Gemini, Codex, OpenCode
│   └── services/        # CLI registry
├── event/               # Event-driven architecture
│   ├── subscribers/     # TypeORM entity subscribers
│   ├── dtos/            # Event payloads
│   └── constants.ts     # Event name constants
└── health/              # Health check endpoint
```

## Modules

### Core Module (`src/core`)
Foundation layer with shared entities, configuration, and services.

### Chat Module (`src/chat`)
- **Endpoints**: CRUD for chats and messages
- **Processing**: Event-driven queue processor for AI execution
- **Agent Actions**: Handles AI response actions

### Workspace Module (`src/workspace`)
- **Endpoints**: CRUD for workspaces
- **Fields**: id, name, description, workingDirectory

### CLI Module (`src/cli`)
Adapter pattern for multiple AI providers:
- ClaudeAdapter (primary)
- GeminiAdapter
- CodexAdapter
- OpencodeAdapter

### Event Module (`src/event`)
- TypeORM subscribers emit events on entity changes
- Processors listen via `@OnEvent()` decorator
- Constants: `ChatEvents.MESSAGE_CREATED`, `ChatEvents.QUEUE_CREATED`

### Health Module (`src/health`)
- `GET /api/health` - Returns status of all CLI adapters

## Database

### Entities

Located in `src/core/entities/`:

| Entity              | Table          | Purpose                                                                  |
| ------------------- | -------------- | ------------------------------------------------------------------------ |
| WorkspaceEntity     | workspaces     | Container for projects (name, description, workingDirectory)             |
| ChatEntity          | chats          | Chat sessions linked to workspaces                                       |
| ChatMessageEntity   | chat_messages  | Messages with actor info (actorType, actorId, text)                      |
| ChatQueueEntity     | chat_queues    | Processing queue (status: pending/in_progress/completed/failed/cancelled)|

### Relationships

- Workspace → has many → Chats (cascade delete)
- Chat → has many → Messages (cascade delete)
- Chat → has many → Queues (cascade delete)

## API Endpoints

### Workspaces
- `GET /api/workspaces` - List workspaces (paginated)
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces/:id` - Get workspace
- `PUT /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace

### Chats
- `GET /api/chats` - List chats (paginated)
- `POST /api/chats` - Create chat
- `GET /api/chats/:id` - Get chat
- `PUT /api/chats/:id` - Update chat
- `DELETE /api/chats/:id` - Delete chat
- `POST /api/chats/:id/cancel` - Cancel processing

### Messages
- `GET /api/chats/:chatId/messages` - List messages
- `POST /api/chats/:chatId/messages` - Create message (triggers AI processing)

## Configuration

### Environment Variables

| Variable                    | Default       | Description                              |
| --------------------------- | ------------- | ---------------------------------------- |
| HOST                        | 127.0.0.1     | Server hostname                          |
| PORT                        | 3456          | Server port                              |
| KALAMARI_DATA_DIR           | ~/.kalamari   | Data directory (database, logs)          |
| KALAMARI_PROCESSOR_DISABLED | -             | Set to '1' to disable queue processor    |

## Key Patterns

- **Modular Architecture**: Self-contained feature modules
- **Dependency Injection**: Constructor-based DI with `@Injectable()`
- **Repository Pattern**: TypeORM repositories in services
- **Adapter Pattern**: CLI adapters for AI providers
- **Event-Driven**: Async processing via EventEmitter
- **DTO Validation**: class-validator decorators at API boundary

## Coding

- Always run `cd .. && make check` after implementing any coding task to verify linting and tests pass.

## Testing

### Test Structure

- **Unit tests** (`src/**/*.spec.ts`) - Test individual components in isolation
- **Integration tests** (`test/**/*.spec.ts`) - Test API endpoints with real database

### Running Tests

```bash
npm test          # Run unit tests
npm run test:e2e  # Run integration tests
```

### Integration Test Utilities

Located in `test/utils.ts`:

- `createTestApp()` - Creates NestApplication with ValidationPipe, uses temp data directory
- `destroyTestApp(app)` - Closes app and cleans up temp directory
- `withUrl(...paths)` - Builds URL for the test server (e.g., `withUrl('/api/workspaces')`)

### Writing Integration Tests

```typescript
import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { DataSource } from 'typeorm';

import { createTestApp, destroyTestApp, withUrl } from '../utils';

describe('GET /api/resource', () => {
  let app: NestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await destroyTestApp(app);
  });

  afterEach(async () => {
    // Clean up test data
    await dataSource.getRepository(Entity).clear();
  });

  it('should return expected response', async () => {
    const res = await axios.get(withUrl('/api/resource'));
    expect(res.status).toBe(200);
  });
});
```

### Test Isolation

- Each test run uses a temporary `KALAMARI_DATA_DIR` to avoid polluting `~/.kalamari`
- Use `afterEach` to clear repositories between tests
- Tests run on a random available port
