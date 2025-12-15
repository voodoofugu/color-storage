import { useState, useEffect, useRef } from "react";

import nexus from "../../../nexusConfig";

import Button from "../Button";

import { setTask } from "../../helpers/taskManager";
import getDeviceId from "../../helpers/getDeviceId";
import api from "../../helpers/api";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function PurchaseWindow() {
  // states
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(true);
  const [loading, setLoading] = useState(false);

  // refs
  const inputRef = useRef<HTMLInputElement>(null);

  // vars
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // funcs
  const checkEmailLogin = async () => {
    if (!isValidEmail) {
      setValidEmail(false);
      setTask(() => setValidEmail(true), 1000, "setValidEmail");
      return;
    }

    setLoading(true);
    // !!! получаем линк сразу для разработки
    const res = await api.authMagicLink<{ status: string; link: string }>(
      email,
      getDeviceId()
    );

    if (!res.resData || res.resData.status === "serverError") {
      setLoading(false);
      nexus.acts.popupOpen("error");
      return;
    }

    if (res.resData.status === "notFound") {
      setLoading(false);
      nexus.acts.popupOpen("payment-notFound");
      return;
    }

    if (res.resData.status === "linkSent") {
      setLoading(false);
      nexus.acts.popupOpen("linkSent");
      nexus.set({ readyToFetch: true }); // устанавливаем флаг для fetchDataServer

      // потом убрать
      setTimeout(() => {
        window.open(res.resData?.link);
      }, 1000);
    }
  };

  const purchaseHandel = async () => {
    if (!isValidEmail) {
      setValidEmail(false);
      setTask(() => setValidEmail(true), 1000, "setValidEmail");
      return;
    }

    const startPayment = await api.startPayment<{ url: string }>(
      email,
      getDeviceId()
    );

    if (!startPayment.resData) {
      nexus.acts.popupOpen("error");
      return;
    }
    // вместо stripe — идём на промежуточную страницу
    const startPaymentUrl = `${backendUrl}/Checkout?stripeUrl=${encodeURIComponent(
      startPayment.resData.url
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
        To purchase the pro version, specify your email address:
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
            text="login"
            loader={loading}
            onClick={checkEmailLogin}
          />
        </div>
      </div>

      <Button
        className={`popup-btn${!isValidEmail ? " disabled" : ""}`}
        text="Get Pro - $4.99"
        // loader={true}
        onClick={purchaseHandel}
      />
    </div>
  );
}

export default PurchaseWindow;
