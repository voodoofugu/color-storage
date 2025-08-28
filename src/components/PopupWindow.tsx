import type { MouseEventHandler } from "react";

import { state, actions } from "../../nexusConfig.ts";

import Button from "./Button";

function SettingsWindow() {
  return (
    <div className="settings-content">
      <h2>Settings</h2>
      <p>Adjust your preferences here.</p>
    </div>
  );
}

function PurchaseWindow() {
  return (
    <div className="purchase-content">
      <h2>Purchase</h2>
      <p>Complete your purchase here.</p>
    </div>
  );
}

function PopupWindow() {
  const popupContent = state.useNexus("popupContent");
  console.log("popupContent", popupContent);

  return popupContent ? (
    <div className="popup-window">
      {popupContent}
      <Button svgID="plus" className="close-btn" onClick={actions.popupClose} />
    </div>
  ) : null;
}

export { SettingsWindow, PurchaseWindow };
export default PopupWindow;
