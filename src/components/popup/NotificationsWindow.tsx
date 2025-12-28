type NotificationsWindowT = {
  text?: string;
};

function NotificationsWindow({ text }: NotificationsWindowT) {
  let message;
  switch (text) {
    case "error":
      message = "An error occurred. 😞";
      break;

    default:
      message = text;
  }

  return (
    <div className="popup-content notif">
      <div className="notif-text">{message}</div>
    </div>
  );
}

export default NotificationsWindow;
