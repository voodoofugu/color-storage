import api from "../helpers/request/api";

// Логика иконки
let isActive = false;
let theme = "light";

function updateIcon() {
  const state = isActive ? "active" : "inactive";
  chrome.action.setIcon({
    path: {
      "16": `icons/${theme}-${state}-16.png`,
      "48": `icons/${theme}-${state}-48.png`,
      "128": `icons/${theme}-${state}-128.png`,
    },
  });
}

// При подключении popup
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "popup") {
    port.onMessage.addListener((msg) => {
      if (msg.type === "popup_opened") {
        isActive = true;
        updateIcon();
      }
    });

    port.onDisconnect.addListener(() => {
      isActive = false;
      updateIcon();

      // port.disconnect();
    });
  }
});

const getUserData = async (id: string) => {
  const req = await api.getUserData<{ userData: Record<string, string> }>(id);
  if (!req.resData) return;

  chrome.storage.local.set({
    userData: req.resData.userData,
  });
};

// слушаем сообщения
chrome.runtime.onMessage.addListener((message) => {
  // При изменении темы от themeWatcher или App
  if (message.type === "theme") {
    theme = message.theme;
    updateIcon();
  }

  // сервер
  // Обработка платежей
  if (message.payment === "pending") {
    //
  }

  if (message.payment === "success") {
    //
    // message.id получаем все данные оплаты
    getUserData(message.id);
  }

  if (message.payment === "found") {
    //
  }

  if (message.payment === "cancel") {
    //
  }

  chrome.storage.local.set({ payment: message.payment });
});
