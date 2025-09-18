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

// слушаем сообщения
chrome.runtime.onMessage.addListener((message) => {
  // При изменении темы от themeWatcher.js
  if (message.type === "theme") {
    theme = message.theme;
    updateIcon();
  }

  // сервер
  // Обработка платежей
  if (message.payment === "pending") {
    chrome.storage.local.set({
      payment: message.payment,
    });
  }

  if (message.payment === "success") {
    // для большей безопасности полученные данные оплаты надо снова проверить на их наличие в BD!!!
    chrome.storage.local.set({
      payment: message.payment,
    });

    // message.id
  }

  if (message.payment === "cancel") {
    chrome.storage.local.set({ payment: message.payment });
  }
});
