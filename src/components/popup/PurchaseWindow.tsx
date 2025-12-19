import { useState, useEffect, useRef } from "react";

import nexus from "../../../nexusConfig";

import Button from "../Button";

import { setTask } from "../../helpers/taskManager";
import getDeviceId from "../../helpers/getDeviceId";
import api from "../../helpers/request/api";
import checkEmailLogin from "../../helpers/request/checkEmailLogin";
import isValidEmail from "../../helpers/isValidEmail";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function PurchaseWindow() {
  // states
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [purchaseLoad, setPurchaseLoad] = useState(false);

  // refs
  const inputRef = useRef<HTMLInputElement>(null);

  // funcs
  const checkEmailLoginLocal = async () => {
    await checkEmailLogin({ email, setValidEmail, setLoading });
  };

  const purchaseHandel = async () => {
    if (!isValidEmail(email)) {
      setValidEmail(false);
      setTask(() => setValidEmail(true), 1000, "setValidEmail");
      return;
    }

    setPurchaseLoad(true);
    const startPayment = await api.startPayment<{ url: string }>(
      email,
      getDeviceId()
    );

    if (!startPayment.resData) {
      nexus.acts.popupOpen("error"); // можно сделать оплата не удалась
      return;
    }
    // вместо stripe — идём на промежуточную страницу
    const startPaymentUrl = `${backendUrl}/Checkout?stripeUrl=${encodeURIComponent(
      startPayment.resData.url
    )}&email=${encodeURIComponent(email)}&deviceId=${getDeviceId()}`;

    window.open(startPaymentUrl, "_blank");
    setPurchaseLoad(false);
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
            loader={loading}
            onClick={checkEmailLoginLocal}
          />
        </div>
      </div>

      <Button
        className={`popup-btn${!isValidEmail(email) ? " disabled" : ""}`}
        text="Get Pro - $4.99"
        loader={purchaseLoad}
        onClick={purchaseHandel}
      />
    </div>
  );
}

export default PurchaseWindow;
