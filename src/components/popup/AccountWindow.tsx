import { useState } from "react";
import { MorphScroll } from "morphing-scroll";

import Button from "../Button";
import nexus from "../../../nexusConfig";
import api from "../../helpers/request/api";
import getDeviceId from "../../helpers/getDeviceId";
import { setTask } from "../../helpers/taskManager";
import { loadUser } from "../../helpers/request/fetchDataServer";

type ThemeT = "light" | "dark" | "system" | null;

function AccountWindow() {
  // nexus
  const userData = nexus.use("userData");
  const themeSettings = nexus.use("themeSettings");

  // states
  const [successUpdate, setSuccessUpdate] = useState(false);

  // vars
  const devices =
    userData && Object.keys(userData).length > 0
      ? userData.deviceId.split("/").length
      : 0;

  // funcs
  const onChangeTheme = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ThemeT;

    nexus.set({ themeSettings: value === "system" ? null : value });
  };

  const exitHandler = async () => {
    const res = await api.authLogout<{ status: string }>(getDeviceId());

    nexus.set({ isPro: false, userData: null, timestamp: 0 });
    if (res.resData?.status === "success") nexus.acts.popupClose();
    else nexus.acts.popupOpen({ text: "error" });
  };

  const error = () => {
    nexus.acts.clarificationClose();
    nexus.acts.popupOpen({ text: "error" });
    return;
  };

  const resetDevices = async () => {
    nexus.acts.clarificationOpen(
      "Resetting active devices will delete them except for the current device:",
      async () => {
        const res = await api.devicesReset<{ status: string }>(getDeviceId());
        if (!res.resData || res.resData.status !== "success") error();

        const { status } = await loadUser();
        if (status !== "success") {
          exitHandler();
          error();
          return;
        }

        nexus.acts.clarificationClose();
        nexus.acts.popupOpen({ text: "Devices have been reset ✅" });
      }
    );
  };

  const updateUser = async () => {
    const { status } = await loadUser();

    if (status !== "success") {
      exitHandler();
      error();
      return;
    }

    setSuccessUpdate(true);
    setTask(() => setSuccessUpdate(false), 2000);
  };

  return (
    <div className="popup-content">
      <div className="popup-title">Account</div>
      <Button
        className={`withoutBg update-btns${
          successUpdate ? " disabled green" : ""
        }`}
        svgID={`${successUpdate ? "check" : "update"}`}
        onClick={updateUser}
      />

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
                <input className="popup-input" type="email"></input>
              </div>
              <div className="text-box">
                <div className="popup-text bold">
                  Devices:
                  <Button
                    className={`restore-btn${devices < 2 ? " disabled" : ""}`}
                    text="reset"
                    onClick={resetDevices}
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
                value={!themeSettings ? "system" : themeSettings}
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
            onClick={exitHandler}
          />
        </MorphScroll>
      </div>
    </div>
  );
}

export default AccountWindow;
