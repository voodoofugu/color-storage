interface DeviceInfo {
  userAgent: string;
  language: string;
  platform: string;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
  };
  timezone: string;
  uaData?: NavigatorUAData; // добавили опционально
}

function getDeviceInfo(): DeviceInfo {
  const info: DeviceInfo = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  if (navigator.userAgentData) {
    info.uaData = navigator.userAgentData;
  }

  return info;
}

// Простой хэш на основе строки
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Приводим к 32-битному числу
  }
  return Math.abs(hash).toString(16); // Возвращаем hex строку
}

function getDeviceId(): string {
  const info = getDeviceInfo();

  // Собираем строку из стабильных параметров
  const rawString = [
    info.uaData
      ? JSON.stringify({
          brands: info.uaData.brands
            .map((b) => `${b.brand}:${b.version}`)
            .join("|"),
          mobile: info.uaData.mobile,
          platform: info.uaData.platform,
        })
      : info.userAgent, // fallback
    info.screen.width,
    info.screen.height,
    info.screen.colorDepth,
    info.language,
  ].join("|");

  console.log("info", info);
  return simpleHash(rawString);
}

export default getDeviceId;
