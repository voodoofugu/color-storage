import type { NotifT } from "../PopupWindow";

import { actions } from "../../../nexusConfig";

type NotificationsWindowT = {
  notifType: NotifT | null;
  props?: { [key: string]: unknown };
};

function PaymentFound({ deviceIds }: { deviceIds: number }) {
  return (
    <>
      Payment Found! 🎉
      <div className="popup-text small">
        <b>{deviceIds}/3</b> of the devices are used.
      </div>
    </>
  );
}

function RestoreLimit() {
  const openSettings = () => actions.popupOpen("settingsWindow");
  return (
    <>
      Max devices connected 3/3. 👀
      <div className="popup-text small">
        If you want to reset them, open the{" "}
        <div className="link" onClick={openSettings}>
          Settings
        </div>
        .
      </div>
    </>
  );
}

function NotificationsWindow({ notifType, props }: NotificationsWindowT) {
  {
    let message;

    switch (notifType) {
      case "payment-notFinished":
        message = "Payment is not finished! 😞💧";
        break;
      case "payment-success":
        message = "Payment Successful! 🎉";
        break;
      case "payment-found":
        message = <PaymentFound deviceIds={props?.deviceIds as number} />;
        break;
      case "payment-notFound":
        message = "Your Payment was not found! 👀";
        break;
      case "payment-cancelled":
        message = "Payment Cancelled! 😞";
        break;
      case "payment-notExists":
        message = "Payment not found! 😞";
        break;
      case "restore-limit":
        message = <RestoreLimit />;
        break;
      case "error":
        message = "An error occurred. Please try again. 😞";
        break;
    }

    return (
      message && (
        <div className="popup-content notif">
          <div className="notif-text">{message}</div>
        </div>
      )
    );
  }
}

export default NotificationsWindow;
