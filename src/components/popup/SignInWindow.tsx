import { useState, useEffect, useRef } from "react";

import Button from "../Button";

import { setTask } from "../../helpers/taskManager";
import checkEmailLogin from "../../helpers/request/checkEmailLogin";
import isValidEmail from "../../helpers/isValidEmail";

function SignInWindow() {
  // states
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(true);
  const [loading, setLoading] = useState(false);

  // refs
  const inputRef = useRef<HTMLInputElement>(null);

  // funcs
  const checkEmailLoginLocal = async () => {
    await checkEmailLogin({ email, setValidEmail, setLoading });
  };

  const inputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTask(() => setEmail(e.target.value), 200, "setValidEmail");
  };

  const inputOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      checkEmailLoginLocal();
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
        onClick={checkEmailLoginLocal}
      />
    </div>
  );
}

export default SignInWindow;
