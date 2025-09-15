import { useRef, useState } from "react";

import Button from "../Button";

import { actions } from "../../../nexusConfig";

import { setManagedTask } from "../../helpers/taskManager";
import getDeviceId from "../../helpers/getDeviceId";

function RestoreLimitWindow() {
  // states
  const [id, setId] = useState("");
  const [validId, setValidId] = useState(true);

  // refs
  const inputRef = useRef<HTMLInputElement>(null);

  // vars
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const isValidId = /^cs_(test|live)_[A-Za-z0-9]+$/.test(id);

  // funcs
  const inputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManagedTask(() => setId(e.target.value), 200, "setValidId");
  };

  const checkStatus = async () => {
    if (!isValidId) {
      setValidId(false);
      setManagedTask(() => setValidId(true), 1000, "setValidId");
      return;
    }

    chrome.storage.local.get(["id"], async (result) => {
      if (!result.id) {
        actions.popupOpen("payment-notFound");
        return;
      }

      const res = await fetch(`${backendUrl}/api/check-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: result.id, deviceId: getDeviceId() }), // deviceId!!!
      });

      const data = await res.json();

      if (data.status === "notFound") {
        actions.popupOpen("payment-notFound");
      } else if (data.status === "limit") {
        // лимит по устройствам превышен
      }
    });
  };

  const inputOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      checkStatus();
    }
  };

  return (
    <div className="popup-content">
      <div className="popup-title">Restore</div>
      <div className="popup-text">
        To restore your pro version, please enter your ID from <b>email</b>:
      </div>

      <div className={`input-wrap${!validId ? " invalid" : ""}`}>
        <input
          ref={inputRef}
          className="popup-input"
          type="ID"
          name="ID"
          required
          placeholder="ID"
          onChange={inputOnChange}
          onKeyDown={inputOnKeyDown}
        />
      </div>

      <Button className="popup-btn" text="Check" onClick={checkStatus} />
    </div>
  );
}

export default RestoreLimitWindow;
