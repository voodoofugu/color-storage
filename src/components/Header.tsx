import nexus from "../../nexusConfig.ts";

import Button from "./Button";

// import isExtensionEnv from "../extension/isExtensionEnv";

function Header() {
  // nexus
  const paletteHidden = nexus.use("paletteHidden");
  const isPro = nexus.use("isPro");
  const userData = nexus.use("userData");

  // funcs
  const PaletteIconHandler = () => {
    nexus.set((prev) => ({ paletteHidden: !prev.paletteHidden }));
  };

  const openSettings = () => nexus.acts.popupOpen("accountWindow");

  const toRestore = () => {
    nexus.acts.popupOpen("signInWindow");
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
