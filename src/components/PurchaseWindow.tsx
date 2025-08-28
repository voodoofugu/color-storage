import { useState } from "react";
import Button from "./Button";

import { setManagedTask } from "../helpers/taskManager";

function PurchaseWindow() {
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(true);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const checkEmail = async () => {
    if (!isValidEmail) {
      setValidEmail(false);
      setManagedTask(() => setValidEmail(true), 1000, "setValidEmail");
      return;
    }

    try {
      const res = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.exists) {
        console.log("✅ Email found!");
      } else {
        console.log("❌ Email not found.");
      }
    } catch {
      setValidEmail(false);
      setManagedTask(() => setValidEmail(true), 1000, "setValidEmail");
    }
  };

  const purchaseHandel = async () => {
    if (!isValidEmail) {
      setValidEmail(false);
      setManagedTask(() => setValidEmail(true), 1000, "setValidEmail");

      return;
    }

    {
      try {
        const res = await fetch(
          "/api/checkout", // деплой Vercel
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }
        );

        if (!res.ok) throw new Error("Server error");

        const { url } = await res.json();
        window.open(url, "_blank"); // открываем в новом окне
      } catch (err) {
        console.error("Purchase error:", err);
      }
    }
  };

  const inputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManagedTask(() => setEmail(e.target.value), 200, "setValidEmail");
  };

  return (
    <div className="purchase-content">
      <div className="popup-title">Purchase</div>
      <div className="popup-text">
        To purchase or restore the pro version, specify your email address:
      </div>

      <div className={`input-wrap${!validEmail ? " invalid" : ""}`}>
        <input
          className="popup-input"
          type="text"
          placeholder="Email"
          onChange={inputOnChange}
        />
        <div className="popup-text small">
          I already have a pro version:{" "}
          <div className="restore-btn" onClick={checkEmail}>
            restore
          </div>
        </div>
      </div>

      <Button
        // svgID="plus"
        className="popup-btn"
        text="Purchase Pro - $4.99"
        onClick={purchaseHandel}
      />
    </div>
  );
}

export default PurchaseWindow;
