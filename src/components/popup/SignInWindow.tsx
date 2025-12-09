import { useState, useEffect, useRef } from "react";

import nexus from "../../../nexusConfig";

import Button from "../Button";

import { setTask } from "../../helpers/taskManager";
import getDeviceId from "../../helpers/getDeviceId";
import api from "../../helpers/api";

function SignInWindow() {
  // states
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(true);
  const [loading, setLoading] = useState(false);

  // refs
  const inputRef = useRef<HTMLInputElement>(null);

  // vars
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // funcs
  const checkHandler = async () => {
    if (!isValidEmail) {
      setValidEmail(false);
      setTask(() => setValidEmail(true), 1000, "setValidEmail");
      return;
    }

    setLoading(true);
    // !!! получаем линк сразу для разработки
    const res = await api.authMagicLink(email, getDeviceId());

    if (!res.data || res.data.status === "serverError") {
      setLoading(false);
      nexus.acts.popupOpen("error");
    } else if (res.data.status === "linkSent") {
      setLoading(false);
      nexus.acts.popupOpen("linkSent");
      nexus.set({ readyToFetch: true }); // устанавливаем флаг для fetchDataServer

      // потом убрать
      setTimeout(() => {
        window.open(res.data.link);
      }, 1000);
    }
  };

  const inputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTask(() => setEmail(e.target.value), 200, "setValidEmail");
  };

  const inputOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      checkHandler();
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
        loader={loading}
        onClick={checkHandler}
      />
    </div>
  );
}

export default SignInWindow;
