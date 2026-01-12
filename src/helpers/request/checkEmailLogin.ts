import nexus from "../../../nexusConfig";

import getDeviceId from "../getDeviceId";
import api from "./api";

const checkEmailLogin = async ({ email }: { email: string }) => {
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
