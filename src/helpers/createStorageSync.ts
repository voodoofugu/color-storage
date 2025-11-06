import storage from "./storage";
import nexus from "../../nexusConfig";
import type { StorageItem } from "./storage";

export function createStorageSync(
  items: StorageItem[],
  sourceName = "storage",
  callback?: () => void
) {
  // --- Первичная загрузка из хранилища ---
  (async () => {
    await Promise.all(
      items.map((item) =>
        storage([
          {
            name: item.name,
            type: item.type,
            onRead: (data) => {
              if (data !== undefined && data !== null) {
                nexus.set({ [item.name]: data }, sourceName);
              }
            },
          },
        ])
      )
    );

    // ✅ Все данные загружены — вызываем callback
    try {
      callback?.();
    } catch (err) {
      console.warn("[createStorageSync] Callback failed:", err);
    }
  })();

  // --- Подключаем middleware ---
  nexus.middleware((prev, next, context) => {
    if (context?.source === sourceName) return;

    const changed = items.filter((item) => prev[item.name] !== next[item.name]);

    if (changed.length === 0) return;

    Promise.all(
      changed.map((item) =>
        storage([
          {
            name: item.name,
            type: item.type,
            value: next[item.name],
          },
        ])
      )
    );
  });
}

export default createStorageSync;
