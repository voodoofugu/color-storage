import { useState } from "react";

import isValidEmail from "../helpers/isValidEmail";
import { setTask } from "../helpers/taskManager";

function useEmailInput({ debounce = 200 } = {}) {
  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState(true);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTask(() => setEmail(value), debounce, "emailInput");
  };

  const validate = () => {
    const ok = isValidEmail(email);
    setIsValid(ok);
    if (!ok) {
      setTask(() => setIsValid(true), 1000, "emailInvalid");
    }
    return ok;
  };

  return {
    email,
    isValid,
    onChange,
    validate,
  };
}

export default useEmailInput;
