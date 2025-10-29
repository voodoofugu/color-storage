import { useState, useEffect, useRef } from "react";

import nexus from "../../../nexusConfig";

import Button from "../Button";

import { setManagedTask } from "../../helpers/taskManager";
import getDeviceId from "../../helpers/getDeviceId";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

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
      setManagedTask(() => setValidEmail(true), 1000, "setValidEmail");
      return;
    }

    setLoading(true);
    const res = await fetch(`${backendUrl}/api/auth/request-magic-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, deviceId: getDeviceId() }),
    });

    // !!! получаем линк сразу для разработки
    const { status, link } = await res.json();
    if (status === "linkSent") {
      setLoading(false);
      nexus.acts.popupOpen("linkSent");

      setTimeout(() => {
        window.open(link);
      }, 1000);
    }

    if (status === "serverError" || !status) {
      setLoading(false);
      nexus.acts.popupOpen("error");
    }
  };

  const inputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManagedTask(() => setEmail(e.target.value), 200, "setValidEmail");
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
