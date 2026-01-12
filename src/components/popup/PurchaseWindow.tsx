import { useState, useEffect, useRef } from "react";

import nexus from "../../../nexusConfig";

import Button from "../Button";

import { setTask } from "../../helpers/taskManager";
import getDeviceId from "../../helpers/getDeviceId";
import api from "../../helpers/request/api";
import checkEmailLogin from "../../helpers/request/checkEmailLogin";
import isValidEmail from "../../helpers/isValidEmail";

import useEmailInput from "../../hooks/useEmailInput";

function PurchaseWindow() {
  // refs
  const inputRef = useRef<HTMLInputElement>(null);

  // hooks
  const { email, isValid, onChange, validate } = useEmailInput();

  // funcs
  const checkEmailLoginLocal = async () => {
    if (!validate()) return;
    await checkEmailLogin({ email });
  };

  const purchaseHandel = async () => {
    if (!validate()) return;

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

      <div className={`input-wrap${!isValid ? " invalid" : ""}`}>
        <input
          ref={inputRef}
          id="purchaseEmailInput"
          className="popup-input"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="Email"
          onChange={onChange}
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
