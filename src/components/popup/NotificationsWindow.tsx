type NotificationsWindowT = {
  notifType:
    | "payment-notFinished"
    | "payment-success"
    | "payment-found"
    | "payment-notFound"
    | "payment-cancelled"
    | "payment-notExists"
    | "error";
};

function NotificationsWindow({ notifType }: NotificationsWindowT) {
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
        message = "Payment Found! 🎉";
        break;
      case "payment-notFound":
        message = "Your Payment was not found! 👀";
        break;
      case "payment-cancelled":
        message = "Payment Cancelled! 😞💧";
        break;
      case "payment-notExists":
        message = "Payment not found! 😞💧";
        break;
      case "error":
        message = "An error occurred. Please try again. 😞💧";
        break;

      default:
        message = "Unknown notification type.";
    }

    return <div className="text-content">{message}</div>;
  }
}

export default NotificationsWindow;
