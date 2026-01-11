import { useState } from "react";

import nexus from "../../nexusConfig";
import Button from "./Button";

function ClarificationWindow() {
  const [viewCancel, setViewCancel] = useState(true);
  const clarificationPopup = nexus.use("clarificationPopup");

  return clarificationPopup ? (
    <div className="clarification-window">
      <div className="popup-bg" onClick={nexus.acts.clarificationClose}></div>

      <div className="clarification-content">
        <div className="clarification-text ">{clarificationPopup.text}</div>
        <div className="clarification-btn-box">
          {viewCancel && (
            <Button text="cancel" onClick={nexus.acts.clarificationClose} />
          )}
          <Button
            className="ok-btn"
            text="ok"
            onClick={async () => {
              setViewCancel(false);
              await clarificationPopup.onConfirm();
              setViewCancel(true);
            }}
          />
        </div>
      </div>
    </div>
  ) : (
    <div className="clarification-window" />
  );
}

export default ClarificationWindow;
