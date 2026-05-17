import { describe, expect, it, vi } from 'vitest';
import { createKeyValueStorage } from './keyValueStorageCore';

interface MemoryLocalStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

function createMemoryLocalStorage(): {
  storage: MemoryLocalStorage;
  read: (key: string) => string | undefined;
} {
  const map = new Map<string, string>();
  return {
    storage: {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => {
        map.set(key, value);
      },
      removeItem: (key: string) => {
        map.delete(key);
      },
    },
    read: (key: string) => map.get(key),
  };
}

describe('keyValueStorage', () => {
  it('uses localStorage fallback on web for get/set/delete', async () => {
    const local = createMemoryLocalStorage();
    const secureStore = {
      getItemAsync: vi.fn<(key: string) => Promise<string | null>>(
        async () => null,
      ),
      setItemAsync: vi.fn<(key: string, value: string) => Promise<void>>(
        async () => {},
      ),
      deleteItemAsync: vi.fn<(key: string) => Promise<void>>(async () => {}),
    };

    const storage = createKeyValueStorage({
      platformOS: 'web',
      secureStore,
      getLocalStorage: () => local.storage,
    });

    await storage.setItem('nexa.key', 'value-1');
    expect(local.read('nexa.key')).toBe('value-1');
    await expect(storage.getItem('nexa.key')).resolves.toBe('value-1');

    await storage.deleteItem('nexa.key');
    await expect(storage.getItem('nexa.key')).resolves.toBeNull();

    expect(secureStore.getItemAsync).not.toHaveBeenCalled();
    expect(secureStore.setItemAsync).not.toHaveBeenCalled();
    expect(secureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it('returns null and does not throw when localStorage is unavailable on web', async () => {
    const storage = createKeyValueStorage({
      platformOS: 'web',
      secureStore: {
        getItemAsync: async () => null,
        setItemAsync: async () => {},
        deleteItemAsync: async () => {},
      },
      getLocalStorage: () => null,
    });

    await expect(storage.getItem('nexa.key')).resolves.toBeNull();
    await expect(storage.setItem('nexa.key', 'value')).resolves.toBeUndefined();
    await expect(storage.deleteItem('nexa.key')).resolves.toBeUndefined();
  });

  it('uses SecureStore on native platforms', async () => {
    const secureStore = {
      getItemAsync: vi.fn<(key: string) => Promise<string | null>>(
        async () => 'native-value',
      ),
      setItemAsync: vi.fn<(key: string, value: string) => Promise<void>>(
        async () => {},
      ),
      deleteItemAsync: vi.fn<(key: string) => Promise<void>>(async () => {}),
    };

    const storage = createKeyValueStorage({
      platformOS: 'ios',
      secureStore,
      getLocalStorage: () => null,
    });

    await expect(storage.getItem('nexa.key')).resolves.toBe('native-value');
    await storage.setItem('nexa.key', 'new-native-value');
    await storage.deleteItem('nexa.key');

    expect(secureStore.getItemAsync).toHaveBeenCalledWith('nexa.key');
    expect(secureStore.setItemAsync).toHaveBeenCalledWith(
      'nexa.key',
      'new-native-value',
    );
    expect(secureStore.deleteItemAsync).toHaveBeenCalledWith('nexa.key');
  });
});
