import { store, actions } from "../../nexusConfig.ts";

import Button from "./Button";

// import isExtensionEnv from "../extension/isExtensionEnv";

function Header() {
  // nexus
  const paletteHidden = store.useNexus("paletteHidden");
  const isPro = store.useNexus("isPro");
  const userData = store.useNexus("userData");

  // funcs
  const PaletteIconHandler = () => {
    store.setNexus((prev) => ({ paletteHidden: !prev.paletteHidden }));
  };

  const openSettings = () => actions.popupOpen("accountWindow");

  const toRestore = () => {
    actions.popupOpen("signInWindow");
  };

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
          className="sign flat header-btn"
          svgID="account"
          onClick={openSettings}
        />
      ) : (
        <Button
          className="sign flat header-btn"
          svgID="sign"
          onClick={toRestore}
        />
      )}
    </>
  );
}

export default Header;
