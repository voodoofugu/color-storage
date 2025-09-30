import { useState, useEffect, useRef } from "react";

import { state, actions } from "../../../nexusConfig";

import Button from "../Button";

import { setManagedTask } from "../../helpers/taskManager";
import getDeviceId from "../../helpers/getDeviceId";

import getUserData from "../../helpers/getUserData";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function SignInWindow() {
  // states
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(true);

  // refs
  const inputRef = useRef<HTMLInputElement>(null);

  // vars
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // funcs
  const restoreHandler = async () => {
    if (!isValidEmail) {
      setValidEmail(false);
      setManagedTask(() => setValidEmail(true), 1000, "setValidEmail");
      return;
    }

    const res = await fetch(`${backendUrl}/api/email-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, deviceId: getDeviceId() }),
    });

    const { status, deviceIds, id } = await res.json();

    switch (status) {
      case "notFound":
        actions.popupOpen("payment-notFound");
        break;

      case "limit":
        actions.popupOpen("restore-limit");
        break;

      case "paid":
        state.setNexus({ isPro: true });
        actions.popupOpen("payment-found", {
          deviceIds: deviceIds.length,
        });

        getUserData(id);
        break;

      case "cancelled":
        actions.popupOpen("payment-cancelled");
        break;

      default:
        actions.popupOpen("error");
    }
  };

  const inputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManagedTask(() => setEmail(e.target.value), 200, "setValidEmail");
  };

  const inputOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      restoreHandler();
    }
  };

  // effects
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // render
  return (
    <div className="popup-content">
      <div className="popup-title">Account</div>
      <div className="popup-text">
        Enter your email address to get the full version of the extension:
      </div>

      <div className={`input-wrap${!validEmail ? " invalid" : ""}`}>
        <input
          ref={inputRef}
          className="popup-input"
          type="email"
          name="email"
          required
          placeholder="Email"
          onChange={inputOnChange}
          onKeyDown={inputOnKeyDown}
        />
      </div>

      <Button
        className={`popup-btn${!isValidEmail ? " disabled" : ""}`}
        text="Sign in"
        onClick={restoreHandler}
      />
    </div>
  );
}

export default SignInWindow;
