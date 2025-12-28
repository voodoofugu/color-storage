import nexus from "../../../nexusConfig";

import { setTask } from "../taskManager";
import getDeviceId from "../getDeviceId";
import api from "./api";
import isValidEmail from "../isValidEmail";

const checkEmailLogin = async ({
  email,
  setValidEmail,
}: {
  email: string;
  setValidEmail: (value: React.SetStateAction<boolean>) => void;
}) => {
  if (!isValidEmail(email)) {
    setValidEmail(false);
    setTask(() => setValidEmail(true), 1000, "setValidEmail");
    return;
  }

  // !!! получаем линк сразу для разработки
  const res = await api.authMagicLink<{ status: string; link: string }>(
    email,
    getDeviceId()
  );

  if (!res.resData || res.resData.status === "serverError") {
    nexus.acts.popupOpen({ text: "error" });
    return;
  }

  if (res.resData.status === "notFound") {
    nexus.acts.popupOpen({ text: "Payment is not finished! 😞" });
    return;
  }

  if (res.resData.status === "linkSent") {
    nexus.acts.popupOpen({
      text: "Link sent to your email for further verification! ✉️",
    });
    // nexus.set({ readyToFetch: true }); // устанавливаем флаг для fetchDataServer

    // потом убрать
    setTimeout(() => {
      window.open(res.resData?.link);
    }, 1000);
  }
};

export default checkEmailLogin;
