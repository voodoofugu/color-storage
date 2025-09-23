import { MorphScroll } from "morphing-scroll";

import Button from "../Button";

import { state } from "../../../nexusConfig";

type ThemeT = "light" | "dark" | "system" | null;

function SettingsWindow() {
  // states

  // refs

  // nexus-state
  const isPro = state.useNexus("isPro");
  // const userData = state.useNexus("userData");
  const userData = {
    amount: "$5.00",
    completed: "1/21/1970 8:25:18",
    created: "9/19/2025 21:56:07",
    deviceId: "6b43f1e5",
    email: "schilingeorg@gmail.com",
    id: "cs_test_a1aeFewGTiKsref3mAQanPf3GLD548DKJapDBT8kXY1OkccfM6mCPnzVEG",
    status: "paid",
  };
  const theme = state.useNexus("theme");

  // vars
  //   const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const devices = userData.deviceId.split("/").length;

  // funcs
  const onChangeTheme = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ThemeT;
    if (!value) return;

    state.setNexus({ theme: value });
  };

  // effects

  return isPro && userData ? (
    <div className="popup-content">
      <div className="popup-title">Settings</div>

      <div className="popup-contentBox">
        <MorphScroll
          // className="popup-contentBox"
          size="auto"
          objectsSize={[222, "none"]}
          progressTrigger={{
            wheel: true,
            progressElement: <div className="scroll-thumb" />,
          }}
          gap={10}
          scrollBarOnHover
          wrapperAlign={["center", "start"]}
          // edgeGradient={{ size: 10 }}
          wrapperMargin={[0, 2]}
        >
          <div className="contentWrap">
            <div className="popup-title small">User:</div>
            <div className="contentBox">
              <div className="text-box">
                <div className="popup-text bold">
                  Email:
                  <Button className={`restore-btn`} text="change" />
                </div>
                <div className="popup-text">{userData.email}</div>
              </div>
              <div className="text-box">
                <div className="popup-text bold">
                  Devices:
                  <Button
                    className={`restore-btn${devices < 2 ? " disabled" : ""}`}
                    text="reset"
                  />
                </div>
                <div className="popup-text">connected {devices}/3</div>
              </div>
              <div className="text-box">
                <div className="popup-text bold">Subscription:</div>
                <div className="popup-text">{userData.status}</div>
              </div>
            </div>
          </div>
          <div className="contentWrap">
            <div className="popup-title small">Appearance:</div>
            <div className="contentBox">
              <div className="popup-text bold">Theme:</div>
              <select
                className="theme-color"
                id="theme"
                value={theme}
                onChange={onChangeTheme}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
          <div className="contentWrap">
            <div className="popup-title small">Hot keys:</div>
            <div className="contentBox">
              <div className="text-box">
                <div className="popup-text bold">
                  Pick color:
                  <Button className={`restore-btn`} text="change" />
                </div>
                <div className="popup-text">Shift + C</div>
              </div>
            </div>
          </div>
        </MorphScroll>
      </div>
    </div>
  ) : (
    <div className="popup-content">
      <div className="popup-title">Settings</div>
      <div className="popup-text">
        You need to subscribe to unlock this feature
      </div>
    </div>
  );
}

export default SettingsWindow;
