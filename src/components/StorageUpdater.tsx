import React, { useMemo } from "react";

import useStorage, { type StorageItemT } from "../hooks/useStorage";

import { state } from "../../nexusConfig";

function StorageUpdater({ children }: { children: React.ReactNode }) {
  // nexus-state
  const isPro = state.useNexus("isPro");
  const colorStorage = state.useNexus("colorStorage");
  const stableColorStorage = JSON.stringify(colorStorage);
  const paletteHidden = state.useNexus("paletteHidden");
  const isStorageLoaded = state.useNexus("isStorageLoaded");

  // hooks
  const storItem = useMemo(
    () => [
      {
        name: "paletteHidden",
        value: paletteHidden,
        type: "local",
        onLoad: (data: boolean) => {
          if (data) state.setNexus({ paletteHidden: data });
        },
      },
      {
        name: "colorStorage",
        value: colorStorage,
        type: "local",
        remove: !colorStorage.length,
        onLoad: (data: Record<string, string[]>[]) => {
          if (!data.length) return;
          state.setNexus({ colorStorage: data });
        },
      },
      {
        name: "pro",
        value: isPro,
        type: "local",
        onLoad: (data: boolean) => {
          if (data) state.setNexus({ isPro: data });
        },
      },
    ],
    [paletteHidden, stableColorStorage, isPro]
  );

  // в callback обновляем флаг isStorageLoaded
  useStorage(storItem as StorageItemT, (storItem) => {
    if (!isStorageLoaded && storItem.name !== "paletteHidden") return;
    state.setNexus({ isStorageLoaded: true });
  });

  return isStorageLoaded ? children : null;
}

export default StorageUpdater;
