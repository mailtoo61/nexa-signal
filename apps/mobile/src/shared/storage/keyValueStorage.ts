import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import {
  createKeyValueStorage,
  type LocalStorageLike,
} from './keyValueStorageCore';

function getGlobalLocalStorage(): LocalStorageLike | null {
  try {
    const maybeGlobal = globalThis as { localStorage?: LocalStorageLike };
    return maybeGlobal.localStorage ?? null;
  } catch {
    return null;
  }
}

export const keyValueStorage = createKeyValueStorage({
  platformOS: Platform.OS,
  secureStore: SecureStore,
  getLocalStorage: getGlobalLocalStorage,
});
