import nexus from "../../nexusConfig.ts";

import Button from "./Button";

// import isExtensionEnv from "../extension/isExtensionEnv";

function Header() {
  // nexus
  const paletteHidden = nexus.use("paletteHidden");
  const isPro = nexus.use("isPro");
  const userData = nexus.use("userData");
  const syncStatus = nexus.use("syncStatus");

  // funcs
  const PaletteIconHandler = () => {
    nexus.set((prev) => ({ paletteHidden: !prev.paletteHidden }));
  };

  const openAccount = () => nexus.acts.popupOpen("accountWindow");

  const openSignIn = () => {
    nexus.acts.popupOpen("signInWindow");
  };

  return (
    <>
      <Button
        className={`palette flat header-btn${paletteHidden ? " active" : ""}`}
        svgID="palette"
        onClick={PaletteIconHandler}
      />

      <div className="title">
        Color Storage
        <div
          className={`sync-status-el${syncStatus ? ` ${syncStatus}` : ""}`}
        ></div>
      </div>

      {isPro && userData ? (
        <Button
          className="sign flat header-btn"
          svgID="account"
          onClick={openAccount}
        />
      ) : (
        <Button
          className="sign flat header-btn"
          svgID="sign"
          onClick={openSignIn}
        />
      )}
    </>
  );
}

export default Header;
