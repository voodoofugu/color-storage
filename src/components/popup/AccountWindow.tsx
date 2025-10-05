import { useState } from "react";
import { MorphScroll } from "morphing-scroll";

import Button from "../Button";

import { state, actions } from "../../../nexusConfig";

// import isExtensionEnv from "../../extension/isExtensionEnv";

type ThemeT = "light" | "dark" | "system";

function AccountWindow() {
  // states
  const [loading, setLoading] = useState(false);

  // nexus-state
  const userData = state.useNexus("userData");
  const themeSettings = state.useNexus("themeSettings");

  // vars
  const devices =
    userData && Object.keys(userData).length > 0
      ? userData.deviceId.split("/").length
      : 0;

  // funcs
  const onChangeTheme = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ThemeT;

    state.setNexus({ themeSettings: value });
  };

  const exitHandler = async () => {
    setLoading(true);

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const { status } = await res.json();

    if (status === "success") {
      state.setNexus({ isPro: false });
      state.setNexus({ userData: null });
      actions.popupClose();
    } else {
      actions.popupOpen("error");
    }

    setLoading(false);
  };

  return (
    <div className="popup-content">
      <div className="popup-title">Account</div>

      <div className="popup-contentBox">
        <MorphScroll
          className="settings-scroll"
          size="auto"
          objectsSize={[222, "none"]}
          progressTrigger={{
            wheel: true,
            progressElement: <div className="scroll-thumb" />,
          }}
          gap={20}
          scrollBarOnHover
          wrapperAlign={["center", "start"]}
          edgeGradient={{ color: "rgba(0,0,0,0.1)", size: 20 }}
          wrapperMargin={[0, 0, 22, 0]}
          scrollBarEdge={10}
        >
          <div className="contentWrap">
            <div className="popup-title small">User:</div>
            <div className="contentBox">
              <div className="text-box">
                <div className="popup-text bold">
                  Email:
                  <Button className={`restore-btn`} text="change" />
                </div>
                <div className="popup-text">{userData?.email}</div>
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
                <div className="popup-text">{userData?.status}</div>
              </div>
            </div>
          </div>
          <div className="contentWrap">
            <div className="popup-title small">Settings:</div>
            <div className="contentBox">
              <div className="popup-text bold">Theme:</div>
              <select
                className="theme-color"
                id="theme"
                value={themeSettings}
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
          <Button
            className="exit-btn"
            svgID="sign"
            text="Exit"
            loader={loading}
            onClick={exitHandler}
          />
        </MorphScroll>
      </div>
    </div>
  );
}

export default AccountWindow;
