import { useMemo, useCallback } from "react";

import useStorage from "../hooks/useStorage";
import type { StorageItemT } from "../hooks/useStorage";

import { state } from "../../nexusConfig";

function StorageUpdater({ children }: { children: React.ReactNode }) {
  // nexus-state
  const isPro = state.useNexus("isPro");
  const colorStorage = state.useNexus("colorStorage");
  const stableColorStorage = JSON.stringify(colorStorage);
  const paletteHidden = state.useNexus("paletteHidden");
  const isStorageLoaded = state.useNexus("isStorageLoaded");

  // hooks
  const storItem = useMemo<StorageItemT>(
    () => [
      {
        name: "paletteHidden",
        value: paletteHidden,
        type: "local",
        onLoad: (data) => {
          if (data) state.setNexus({ paletteHidden: data as boolean });
        },
      },
      {
        name: "colorStorage",
        value: colorStorage,
        type: "local",
        remove: !colorStorage.length,
        onLoad: (data) => {
          if (typeof data === "object" && !data?.length) return;
          state.setNexus({ colorStorage: data as Record<string, string[]>[] });
        },
      },
      {
        name: "pro",
        value: isPro,
        type: "local",
        onLoad: (data) => {
          if (data) state.setNexus({ isPro: data as boolean });
        },
      },
      {
        name: "userData",
        type: "chrome-local",
        readOnly: true,
        onLoad: (data) => {
          if (!data) return;
          state.setNexus({ userData: data as Record<string, string> });
        },
      },
    ],
    [paletteHidden, stableColorStorage, isPro]
  );

  const handleStorageUpdate = useCallback(() => {
    if (isStorageLoaded) return;
    state.setNexus({ isStorageLoaded: true });
  }, []);

  // в callback обновляем флаг isStorageLoaded
  useStorage(storItem, handleStorageUpdate);

  return isStorageLoaded ? children : null;
}

export default StorageUpdater;
