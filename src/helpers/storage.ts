import type { MyState } from "../../nexus/types";

type StorageTypeT = "local" | "session" | "chrome-local" | "chrome-session";

type StorageValueT = MyState[keyof MyState];

interface StorageItem {
  name: keyof MyState;
  value?: StorageValueT;
  type?: StorageTypeT;
  remove?: boolean;
  onRead?: (data: StorageValueT) => void;
}

function isValidValue(value: StorageValueT): boolean {
  // Пустой массив
  if (Array.isArray(value) && value.length === 0) {
    return false;
  }

  // Пустой объект
  if (
    typeof value === "object" &&
    value !== null &&
    Object.keys(value).length === 0
  ) {
    return false;
  }

  // Примитивы: null, undefined, false, пустая строка, 0
  if (
    value === null ||
    value === undefined ||
    value === false ||
    value === "" ||
    value === 0
  ) {
    return false;
  }

  return true;
}

function chromeExist(): boolean {
  return typeof chrome !== "undefined" && !!chrome.runtime?.id;
}

const getChromeStorageArea = (type: "chrome-local" | "chrome-session") => {
  if (!chromeExist()) {
    console.warn("[nexus-storage] Chrome API is not available");
    return null;
  }
  return type === "chrome-local"
    ? chrome.storage.local
    : chrome.storage.session;
};

async function storage(storItem: StorageItem[], callback?: () => void) {
  if (typeof window === "undefined") {
    console.warn(
      "[nexus-storage] Storage is not available in this environment."
    );
    return {};
  }

  const currentValues: Record<string, unknown> = {};

  await Promise.allSettled(
    storItem.map(async (item) => {
      const { name, type = "local" } = item;

      try {
        // Chrome API
        if (type.startsWith("chrome-")) {
          const area = getChromeStorageArea(
            type as "chrome-local" | "chrome-session"
          );
          if (!area) return;

          // читаем
          if (item.onRead) {
            const stored = await area.get(name);
            const parsed = stored[name] ?? null;
            currentValues[name] = parsed;
            item.onRead?.(parsed as StorageValueT);

            return;
          }

          // записываем
          if (item.remove) {
            await area.remove(name);
            currentValues[name] = null;
          } else if (isValidValue(item.value as StorageValueT)) {
            const toStore: Record<string, unknown> = {};
            toStore[name] = item.value;
            await area.set(toStore);
            currentValues[name] = item.value;
          } else {
            await area.remove(name);
            currentValues[name] = null;
          }

          return;
        }

        // local/sessionStorage
        const storageType = type === "local" ? localStorage : sessionStorage;

        // читаем
        if (item.onRead) {
          const storedValue = storageType.getItem(name);
          const parsed = storedValue ? JSON.parse(storedValue) : null;
          currentValues[name] = parsed;
          item.onRead?.(parsed as StorageValueT);

          return;
        }

        // записываем
        if (item.remove) {
          storageType.removeItem(name);
          currentValues[name] = null;
        } else if (isValidValue(item.value as StorageValueT)) {
          const serialized = JSON.stringify(item.value);
          if (storageType.getItem(name) !== serialized)
            storageType.setItem(name, serialized);
          currentValues[name] = item.value;
        } else {
          storageType.removeItem(name);
          currentValues[name] = null;
        }
      } catch (e) {
        console.error(`[nexus-storage] Failed to handle "${item.name}":`, e);
      }
    })
  );

  try {
    callback?.();
  } catch (cbErr) {
    console.warn(`[nexus-storage] Callback failed:`, cbErr);
  }

  return currentValues;
}

export default storage;
export type { StorageTypeT, StorageItem };
