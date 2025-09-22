import { useState, useEffect, useLayoutEffect } from "react";

// Тип данных
type DataT =
  | Record<string, unknown>
  | unknown[]
  | string
  | number
  | boolean
  | null
  | undefined;

type StorageTypeT = "local" | "session" | "chrome-local" | "chrome-session";
type StorageItemT = Parameters<typeof useStorage>[0];

/** Проверка существования chrome API */
function chromeExist(): boolean {
  return typeof chrome !== "undefined" && !!chrome.runtime?.id;
}

/** Получаем нужное chrome-хранилище */
const getChromeStorageArea = (type: "chrome-local" | "chrome-session") => {
  if (!chromeExist()) {
    console.warn("Chrome API is not available");
    return null;
  }
  return type === "chrome-local"
    ? chrome.storage.local
    : chrome.storage.session;
};

function useStorage(
  storItem: {
    name: string;
    value?: DataT;
    type?: StorageTypeT;
    remove?: boolean;
    readOnly?: boolean;
    onLoad?: (data: DataT) => void;
  }[],
  callback?: () => void
) {
  // Инициализация значений из localStorage/sessionStorage
  const [currentValues, setCurrentValues] = useState(() =>
    storItem.reduce((acc, { name, type }) => {
      if (type === "chrome-local" || type === "chrome-session") {
        acc[name] = null; // chrome API асинхронный — загрузим позже
        return acc;
      }

      const storageType = type === "local" ? localStorage : sessionStorage;
      const storedValue = storageType.getItem(name);
      acc[name] = storedValue ? JSON.parse(storedValue) : null;
      return acc;
    }, {} as Record<string, unknown>)
  );

  /** Загружаем данные из chrome.storage и вызываем onLoad */
  useLayoutEffect(() => {
    storItem.forEach((item) => {
      if (item.onLoad) {
        if (item.type === "chrome-local" || item.type === "chrome-session") {
          const storageArea = getChromeStorageArea(item.type);
          if (!storageArea) return;

          storageArea.get([item.name], (result) => {
            const value = result[item.name];
            if (value !== undefined) {
              item.onLoad?.(value);
              setCurrentValues((prev) => ({ ...prev, [item.name]: value }));
            }
          });
          return;
        }

        // Обычные браузерные хранилища
        const storageType =
          item.type === "local" ? localStorage : sessionStorage;
        const storedValue = storageType.getItem(item.name);
        if (storedValue) {
          const parsedValue = JSON.parse(storedValue);
          item.onLoad(parsedValue);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      console.warn("Storage is not available in this environment.");
      return;
    }

    const run = async () => {
      const tasks = storItem.map(async (item) => {
        try {
          /** ============ ReadOnly ============ */
          if (item.readOnly) {
            if (
              item.type === "chrome-local" ||
              item.type === "chrome-session"
            ) {
              const storageArea = getChromeStorageArea(item.type);
              if (!storageArea) return;

              return new Promise<void>((resolve) => {
                storageArea.get([item.name], (result) => {
                  const value = result[item.name] ?? null;
                  setCurrentValues((prev) => ({ ...prev, [item.name]: value }));
                  item.onLoad?.(value);
                  resolve();
                });
              });
            } else {
              const storageType =
                item.type === "local" ? localStorage : sessionStorage;
              const storedValue = storageType.getItem(item.name);
              const parsedValue = storedValue ? JSON.parse(storedValue) : null;
              setCurrentValues((prev) => ({
                ...prev,
                [item.name]: parsedValue,
              }));
              item.onLoad?.(parsedValue);
              return;
            }
          }

          /** ============ chrome.storage ============ */
          if (item.type === "chrome-local" || item.type === "chrome-session") {
            const storageArea = getChromeStorageArea(item.type);
            if (!storageArea) return;

            return new Promise<void>((resolve) => {
              if (item.remove) {
                storageArea.remove(item.name, resolve);
              } else if (item.value !== undefined) {
                storageArea.set({ [item.name]: item.value }, resolve);
              } else {
                storageArea.remove(item.name, resolve);
              }
            });
          }

          /** ============ localStorage/sessionStorage ============ */
          const storageType =
            item.type === "local" ? localStorage : sessionStorage;

          if (item.remove) {
            storageType.removeItem(item.name);
            setCurrentValues((prev) => ({ ...prev, [item.name]: null }));
            return;
          }

          if (item.value !== undefined) {
            const serializedValue = JSON.stringify(item.value);
            if (storageType.getItem(item.name) !== serializedValue) {
              storageType.setItem(item.name, serializedValue);
              setCurrentValues((prev) => ({
                ...prev,
                [item.name]: item.value,
              }));
            }
          } else {
            storageType.removeItem(item.name);
          }
        } catch (error) {
          console.error(
            `Failed to save item "${item.name}" to ${
              item.type || "local"
            } storage:`,
            error
          );
        }
      });

      await Promise.all(tasks);

      // ✅ Вызов только после завершения всех операций
      if (callback) callback();
    };

    run();
  }, [storItem, callback]);

  return currentValues;
}

export default useStorage;
export type { StorageItemT };
