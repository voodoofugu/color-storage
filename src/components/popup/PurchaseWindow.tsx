import { useEffect, useRef, useState } from "react";

import nexus from "../../../nexusConfig";

import Button from "../Button";

import getDeviceId from "../../helpers/getDeviceId";
import api from "../../helpers/request/api";
import type { SubscriptionPlan } from "../../helpers/request/api";

import useEmailInput from "../../hooks/useEmailInput";

const SUBSCRIPTION_PLANS: Array<{
  id: SubscriptionPlan;
  title: string;
  price: string;
}> = [
  {
    id: "monthly",
    title: "Monthly",
    price: "$4.99",
  },
  {
    id: "yearly",
    title: "Yearly",
    price: "$49.99",
  },
];

function PurchaseWindow() {
  // refs
  const inputRef = useRef<HTMLInputElement>(null);

  // state
  const [plan, setPlan] = useState<SubscriptionPlan>("monthly");

  // hooks
  const { email, validate } = useEmailInput();

  // funcs
  const purchaseHandel = async () => {
    if (!validate()) return;

    const startPayment = await api.startPayment<{ url: string }>(
      email,
      getDeviceId(),
      plan,
    );

    if (!startPayment.resData) {
      nexus.acts.popupOpen({ text: "error" }); // можно сделать оплата не удалась
      return;
    }
    // идём в stripe
    nexus.acts.popupClose();
    window.open(startPayment.resData.url, "_blank");
  };

  // effects
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // render
  return (
    <div className="popup-content purchase-content">
      <div className="popup-title">Purchase</div>
      <div className="popup-text">Choose a subscription plan:</div>

      <div className="subscription-plan-box">
        {SUBSCRIPTION_PLANS.map((subscriptionPlan) => (
          <div className="plan-info-wrap">
            <div className="popup-text">{subscriptionPlan.title}</div>
            <Button
              className={`restore-btn${plan === subscriptionPlan.id ? " active" : " gray"}`}
              text={subscriptionPlan.price}
              onClick={() => setPlan(subscriptionPlan.id)}
            />
          </div>
        ))}
      </div>

      <Button
        className="popup-btn"
        text={plan === "monthly" ? "Subscribe - $5" : "Subscribe - $50"}
        onClick={purchaseHandel}
      />
    </div>
  );
}

export default PurchaseWindow;
