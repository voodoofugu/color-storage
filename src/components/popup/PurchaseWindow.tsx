import { useState, useEffect, useRef } from "react";

import nexus from "../../../nexusConfig";

import Button from "../Button";

import { setTask } from "../../helpers/taskManager";
import getDeviceId from "../../helpers/getDeviceId";
import getUserData from "../../helpers/getUserData";
import api from "../../helpers/api";

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
  const restoreHandler = async () => {
    if (!isValidEmail) {
      setValidEmail(false);
      setTask(() => setValidEmail(true), 1000, "setValidEmail");
      return;
    }

    const { status, deviceIds, id } = await api.emailCheckout(
      email,
      getDeviceId()
    );

    switch (status) {
      case "notFound":
        nexus.acts.popupOpen("payment-notFound");
        break;
      case "limit":
        nexus.acts.popupOpen("restore-limit");
        break;
      case "paid":
        nexus.set({ isPro: true });
        nexus.acts.popupOpen("payment-found", {
          deviceIds: deviceIds.length,
        });

        getUserData(id);
        break;
      case "cancelled":
        nexus.acts.popupOpen("payment-cancelled");
        break;

      default:
        nexus.acts.popupOpen("error");
    }
  };

  const purchaseHandel = async () => {
    if (!isValidEmail) {
      setValidEmail(false);
      setTask(() => setValidEmail(true), 1000, "setValidEmail");
      return;
    }

    const { url } = await api.startPayment(email, getDeviceId());
    // вместо stripe — идём на промежуточную страницу
    const startPaymentUrl = `${backendUrl}/Checkout?stripeUrl=${encodeURIComponent(
      url
    )}&email=${encodeURIComponent(email)}`;

    window.open(startPaymentUrl, "_blank");
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
          <Button
            className="restore-btn"
            text="restore"
            onClick={restoreHandler}
          />
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
