import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

/**
 * Supabase auth-storage adapter backed by the OS keystore (iOS Keychain /
 * Android Keystore) via expo-secure-store.
 *
 * Why: the Supabase session — including the long-lived refresh token — was
 * previously persisted in AsyncStorage, which is unencrypted at rest. On a
 * lost/rooted/backed-up device that token can be exchanged for fresh access
 * tokens, i.e. account takeover. The keystore encrypts values at rest.
 *
 * Two constraints are handled here:
 *  1. SecureStore values are capped at ~2048 bytes; a Supabase session JSON can
 *     exceed that, so values are transparently chunked.
 *  2. The native module may not be present yet (e.g. before a native rebuild
 *     after adding the dependency). We probe once and fall back to AsyncStorage
 *     so the app degrades to its previous behavior instead of crashing.
 *
 * Existing AsyncStorage sessions are migrated on first read so users are not
 * signed out by the switch.
 */

const CHUNK_SIZE = 1800; // leave headroom under the ~2048-byte SecureStore limit
const CHUNK_COUNT_SUFFIX = "__sb_chunks";

// SecureStore keys must match /^[A-Za-z0-9._-]+$/.
function safeKey(key: string): string {
  return key.replace(/[^A-Za-z0-9._-]/g, "_");
}

let availabilityProbe: Promise<boolean> | null = null;
function isSecureStoreAvailable(): Promise<boolean> {
  if (!availabilityProbe) {
    availabilityProbe = (async () => {
      try {
        return await SecureStore.isAvailableAsync();
      } catch {
        return false;
      }
    })();
  }
  return availabilityProbe;
}

async function secureGet(key: string): Promise<string | null> {
  const k = safeKey(key);
  const countRaw = await SecureStore.getItemAsync(`${k}${CHUNK_COUNT_SUFFIX}`);
  if (countRaw == null) {
    return SecureStore.getItemAsync(k);
  }
  const count = parseInt(countRaw, 10);
  let value = "";
  for (let i = 0; i < count; i++) {
    const part = await SecureStore.getItemAsync(`${k}.${i}`);
    if (part == null) return null; // corrupt/partial write — treat as missing
    value += part;
  }
  return value;
}

async function secureRemove(key: string): Promise<void> {
  const k = safeKey(key);
  const countRaw = await SecureStore.getItemAsync(`${k}${CHUNK_COUNT_SUFFIX}`);
  if (countRaw != null) {
    const count = parseInt(countRaw, 10);
    for (let i = 0; i < count; i++) {
      await SecureStore.deleteItemAsync(`${k}.${i}`);
    }
    await SecureStore.deleteItemAsync(`${k}${CHUNK_COUNT_SUFFIX}`);
  }
  await SecureStore.deleteItemAsync(k);
}

async function secureSet(key: string, value: string): Promise<void> {
  const k = safeKey(key);
  await secureRemove(key); // clear any prior (possibly differently-chunked) value

  if (value.length <= CHUNK_SIZE) {
    await SecureStore.setItemAsync(k, value);
    return;
  }

  const count = Math.ceil(value.length / CHUNK_SIZE);
  for (let i = 0; i < count; i++) {
    await SecureStore.setItemAsync(
      `${k}.${i}`,
      value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
    );
  }
  await SecureStore.setItemAsync(`${k}${CHUNK_COUNT_SUFFIX}`, String(count));
}

export const secureAuthStorage = {
  async getItem(key: string): Promise<string | null> {
    if (await isSecureStoreAvailable()) {
      const value = await secureGet(key);
      if (value != null) return value;

      // One-time migration: move any pre-existing plaintext session into the
      // keystore and clear it from AsyncStorage.
      const legacy = await AsyncStorage.getItem(key);
      if (legacy != null) {
        await secureSet(key, legacy);
        await AsyncStorage.removeItem(key);
        return legacy;
      }
      return null;
    }
    return AsyncStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (await isSecureStoreAvailable()) {
      await secureSet(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (await isSecureStoreAvailable()) {
      await secureRemove(key);
    }
    // Also clear any legacy AsyncStorage copy regardless of backend.
    await AsyncStorage.removeItem(key).catch(() => {});
  },
};
