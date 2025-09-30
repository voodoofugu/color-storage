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
