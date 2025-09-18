// import { useRef } from "react";

// import Button from "../Button";

// import { state, actions } from "../../../nexusConfig";

// import { setManagedTask } from "../../helpers/taskManager";
// import getDeviceId from "../../helpers/getDeviceId";

function SettingsWindow() {
  // states

  // refs

  // vars
  //   const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // funcs

  // effects

  return (
    <div className="popup-content">
      <div className="popup-title">Settings</div>

      <div className="popup-contentBox">
        <div className="contentWrap">
          <div className="popup-title small">User info:</div>
          <div className="popup-text">Email:</div>
          <div className="popup-text">Status:</div>
          <div className="popup-text">Devices connected:</div>
        </div>
        <div className="contentWrap">
          <div className="popup-title small">Theme:</div>
        </div>
        <div className="contentWrap">
          <div className="popup-title small">Hot keys:</div>
        </div>
      </div>
    </div>
  );
}

export default SettingsWindow;
