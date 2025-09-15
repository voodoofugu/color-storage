// Проверка и создание offscreen документа
// async function ensureOffscreenDocument() {
//   if (await chrome.offscreen.hasDocument()) return;

//   await chrome.offscreen.createDocument({
//     url: chrome.runtime.getURL("offscreen.html"),
//     reasons: ["DOM_PARSER"], // любое валидное значение
//     justification: "Отслеживание темы браузера",
//   });
// }

// // Вызовы при установке и старте
// chrome.runtime.onInstalled.addListener(ensureOffscreenDocument);
// chrome.runtime.onStartup.addListener(ensureOffscreenDocument);

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

// слушаем сообщения от других частей расширения
chrome.runtime.onMessage.addListener((message) => {
  // При изменении темы от themeWatcher.js
  if (message.type === "theme") {
    theme = message.theme;
    updateIcon();
  }

  // Обработка платежей
  if (message.payment === "pending") {
    chrome.storage.local.set({
      payment: message.payment,
      id: message.id,
    });
  }

  if (message.payment === "success") {
    chrome.storage.local.set({ payment: message.payment, id: message.id }); // на всякий случай обновим id
  }

  if (message.payment === "cancel") {
    chrome.storage.local.set({ payment: message.payment });
  }
});
