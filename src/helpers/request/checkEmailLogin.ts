import nexus from "../../../nexusConfig";

import { setTask } from "../taskManager";
import getDeviceId from "../getDeviceId";
import api from "./api";
import isValidEmail from "../isValidEmail";

const checkEmailLogin = async ({
  email,
  setValidEmail,
  setLoading,
}: {
  email: string;
  setValidEmail: (value: React.SetStateAction<boolean>) => void;
  setLoading: (value: React.SetStateAction<boolean>) => void;
}) => {
  if (!isValidEmail(email)) {
    setValidEmail(false);
    setTask(() => setValidEmail(true), 1000, "setValidEmail");
    return;
  }

  setLoading(true);
  // !!! получаем линк сразу для разработки
  const res = await api.authMagicLink<{ status: string; link: string }>(
    email,
    getDeviceId()
  );

  if (!res.resData || res.resData.status === "serverError") {
    setLoading(false);
    nexus.acts.popupOpen("error");
    return;
  }

  if (res.resData.status === "notFound") {
    setLoading(false);
    nexus.acts.popupOpen("payment-notFound");
    return;
  }

  if (res.resData.status === "linkSent") {
    setLoading(false);
    nexus.acts.popupOpen("linkSent");
    nexus.set({ readyToFetch: true }); // устанавливаем флаг для fetchDataServer

    // потом убрать
    setTimeout(() => {
      window.open(res.resData?.link);
    }, 1000);
  }
};

export default checkEmailLogin;
