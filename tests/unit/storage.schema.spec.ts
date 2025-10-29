// AC-2: Schema version migration guard (unit)
// Red: Expected to fail until storage module provides migration utilities

// Expected APIs (to be implemented later)
// - getCurrentSchemaVersion(): number
// - migrateSchemaIfNeeded(targetVersion?: number): Promise<void>

import { getCurrentSchemaVersion, migrateSchemaIfNeeded } from '../../frontend/lib/storage/indexeddb';

describe('AC-2 Unit — storage schema version', () => {
  test('test_AC-2_unit_schema_version_migration_applies', async () => {
    const v = getCurrentSchemaVersion();
    expect(typeof v).toBe('number');
    await expect(migrateSchemaIfNeeded()).resolves.not.toThrow();
  });
});
