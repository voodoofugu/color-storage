import { useRef, useState, useEffect } from "react";

import Button from "../Button";

import { state, actions } from "../../../nexusConfig";

import { setManagedTask } from "../../helpers/taskManager";
import getDeviceId from "../../helpers/getDeviceId";

function RestoreWindow() {
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

    const res = await fetch(`${backendUrl}/api/check-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, deviceId: getDeviceId() }),
    });

    const data = await res.json();

    switch (data.status) {
      case "notFound":
        actions.popupOpen("payment-notFound");
        break;
      case "limit":
        actions.popupOpen("restore-limit");
        break;
      case "paid":
        state.setNexus({ isPro: true });
        actions.popupOpen("payment-found", {
          deviceIds: data.deviceIds.length,
        });
        break;
      case "cancelled":
        actions.popupOpen("payment-cancelled");
        break;

      default:
        actions.popupOpen("error");
    }
  };

  const inputOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      checkStatus();
    }
  };

  // effects
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
        <div className="popup-text small">
          You can connect only <b>3</b> devices.
        </div>
      </div>

      <Button
        className={`popup-btn${!isValidId ? " disabled" : ""}`}
        text="Check"
        onClick={checkStatus}
      />
    </div>
  );
}

export default RestoreWindow;
