import { state, actions } from "../../nexusConfig.ts";

import Button from "./Button";

// import isExtensionEnv from "../extension/isExtensionEnv";

function Header() {
  // nexus-state
  const paletteHidden = state.useNexus("paletteHidden");
  const isPro = state.useNexus("isPro");
  const userData = state.useNexus("userData");

  // funcs
  const PaletteIconHandler = () => {
    state.setNexus((prev) => ({ paletteHidden: !prev.paletteHidden }));
  };

  const openSettings = () => actions.popupOpen("settingsWindow");

  const toRestore = () => {
    actions.popupOpen("restoreWindow");
  };

  //   const getUserData = async (id: string) => {
  //     if (!isExtensionEnv()) return;

  //     const res = await fetch(
  //       `${import.meta.env.VITE_BACKEND_URL}/api/get-user-data`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ id: id }),
  //       }
  //     );

  //     if (!res.ok) {
  //       console.error("Error during purchase:", res.statusText);
  //       return;
  //     }

  //     const userData = await res.json();
  //     chrome.storage.local.set({
  //       userData,
  //     });
  //   };

  return (
    <>
      <Button
        className={`palette flat header-btn${paletteHidden ? " active" : ""}`}
        svgID="palette"
        onClick={PaletteIconHandler}
      />

      <div className="title">Color Storage</div>

      {isPro && userData ? (
        <Button
          className="settings flat header-btn"
          svgID="settings"
          onClick={openSettings}
        />
      ) : (
        <Button
          className="settings flat header-btn"
          svgID="sign"
          onClick={toRestore}
        />
      )}
    </>
  );
}

export default Header;
