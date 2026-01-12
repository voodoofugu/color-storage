import { useEffect, useRef } from "react";

import Button from "../Button";

import checkEmailLogin from "../../helpers/request/checkEmailLogin";
import isValidEmail from "../../helpers/isValidEmail";

import useEmailInput from "../../hooks/useEmailInput";

function SignInWindow() {
  // refs
  const inputRef = useRef<HTMLInputElement>(null);

  // hooks
  const { email, isValid, onChange, validate } = useEmailInput();

  // funcs
  const checkEmailLoginLocal = async () => {
    if (!validate()) return;
    await checkEmailLogin({ email });
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

      <div className={`input-wrap${!isValid ? " invalid" : ""}`}>
        <input
          ref={inputRef}
          className="popup-input"
          type="email"
          name="email"
          id="signInEmailInput"
          required
          autoComplete="email"
          placeholder="Email"
          onChange={onChange}
          onKeyDown={inputOnKeyDown}
        />
      </div>

      <Button
        className={`popup-btn${!isValidEmail(email) ? " disabled" : ""}`}
        text="Sign in"
        onClick={checkEmailLoginLocal}
      />
    </div>
  );
}

export default SignInWindow;
