export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  deleteItem(key: string): Promise<void>;
}

export interface SecureStoreLike {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

export interface LocalStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface KeyValueStorageDeps {
  platformOS: string;
  secureStore: SecureStoreLike;
  getLocalStorage: () => LocalStorageLike | null;
}

function isWebPlatform(platformOS: string): boolean {
  return platformOS === 'web';
}

export function createKeyValueStorage({
  platformOS,
  secureStore,
  getLocalStorage,
}: KeyValueStorageDeps): KeyValueStorage {
  return {
    async getItem(key: string): Promise<string | null> {
      if (isWebPlatform(platformOS)) {
        const localStorage = getLocalStorage();
        if (!localStorage) return null;
        try {
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      }
      try {
        return await secureStore.getItemAsync(key);
      } catch {
        return null;
      }
    },
    async setItem(key: string, value: string): Promise<void> {
      if (isWebPlatform(platformOS)) {
        const localStorage = getLocalStorage();
        if (!localStorage) return;
        try {
          localStorage.setItem(key, value);
        } catch {
          return;
        }
        return;
      }
      try {
        await secureStore.setItemAsync(key, value);
      } catch {
        return;
      }
    },
    async deleteItem(key: string): Promise<void> {
      if (isWebPlatform(platformOS)) {
        const localStorage = getLocalStorage();
        if (!localStorage) return;
        try {
          localStorage.removeItem(key);
        } catch {
          return;
        }
        return;
      }
      try {
        await secureStore.deleteItemAsync(key);
      } catch {
        return;
      }
    },
  };
}
