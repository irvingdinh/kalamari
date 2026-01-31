# api

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
