import { useState, useEffect, useRef } from "react";

import Button from "../Button";

import { actions } from "../../../nexusConfig";

import { setManagedTask } from "../../helpers/taskManager";
import getDeviceId from "../../helpers/getDeviceId";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function PurchaseWindow() {
  // states
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(true);

  // refs
  const inputRef = useRef<HTMLInputElement>(null);

  // vars
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // funcs
  // предусмотреть ошибки при отсутствии интернета!!!
  const toRestore = () => {
    actions.popupOpen("restoreWindow");
  };

  const purchaseHandel = async () => {
    if (!isValidEmail) {
      setValidEmail(false);
      setManagedTask(() => setValidEmail(true), 1000, "setValidEmail");
      return;
    }

    const res = await fetch(`${backendUrl}/api/start-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, deviceId: getDeviceId() }),
    });

    if (!res.ok) {
      console.error("Error during purchase:", res.statusText);
      return;
    }

    const { url } = await res.json();
    // вместо stripe — идём на промежуточную страницу
    const startPaymentUrl = `${backendUrl}/Checkout?stripeUrl=${encodeURIComponent(
      url
    )}&email=${encodeURIComponent(email)}`;

    window.open(startPaymentUrl, "_blank");
  };

  const inputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManagedTask(() => setEmail(e.target.value), 200, "setValidEmail");
  };

  const inputOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      purchaseHandel();
    }
  };

  // effects
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // render
  return (
    <div className="popup-content">
      <div className="popup-title">Purchase</div>
      <div className="popup-text">
        To purchase or restore the pro version, specify your email address:
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
        <div className="popup-text small">
          I already have a pro version:{" "}
          <Button className="restore-btn" text="restore" onClick={toRestore} />
        </div>
      </div>

      <Button
        className={`popup-btn${!isValidEmail ? " disabled" : ""}`}
        text="Get Pro - $4.99"
        onClick={purchaseHandel}
      />
    </div>
  );
}

export default PurchaseWindow;
