import { useState, useEffect, useRef } from "react";

import nexus from "../../../nexusConfig";

import Button from "../Button";

import { setTask } from "../../helpers/taskManager";
import getDeviceId from "../../helpers/getDeviceId";
import api from "../../helpers/request/api";
import checkEmailLogin from "../../helpers/request/checkEmailLogin";
import isValidEmail from "../../helpers/isValidEmail";

function PurchaseWindow() {
  // states
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(true);

  // refs
  const inputRef = useRef<HTMLInputElement>(null);

  // funcs
  const checkEmailLoginLocal = async () => {
    await checkEmailLogin({ email, setValidEmail });
  };

  const purchaseHandel = async () => {
    if (!isValidEmail(email)) {
      setValidEmail(false);
      setTask(() => setValidEmail(true), 1000, "setValidEmail");
      return;
    }

    const startPayment = await api.startPayment<{ url: string }>(
      email,
      getDeviceId()
    );

    if (!startPayment.resData) {
      nexus.acts.popupOpen({ text: "error" }); // можно сделать оплата не удалась
      return;
    }
    // идём в stripe
    nexus.acts.popupClose();
    window.open(startPayment.resData.url, "_blank");
  };

  const inputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTask(() => setEmail(e.target.value), 200, "setValidEmail");
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
        To purchase the pro version, specify your email address:
      </div>

      <div className={`input-wrap${!validEmail ? " invalid" : ""}`}>
        <input
          ref={inputRef}
          id="purchaseEmailInput"
          className="popup-input"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="Email"
          onChange={inputOnChange}
          onKeyDown={inputOnKeyDown}
        />
        <div className="popup-text small">
          I already have a pro version:{" "}
          <Button
            className="restore-btn"
            text="login"
            onClick={checkEmailLoginLocal}
          />
        </div>
      </div>

      <Button
        className={`popup-btn${!isValidEmail(email) ? " disabled" : ""}`}
        text="Get Pro - $4.99"
        onClick={purchaseHandel}
      />
    </div>
  );
}

export default PurchaseWindow;
