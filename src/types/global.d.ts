interface NavigatorUADataBrand {
  brand: string;
  version: string;
}

interface NavigatorUAData {
  brands: NavigatorUADataBrand[];
  mobile: boolean;
  platform: string;

  // Современный метод для получения детальных данных
  getHighEntropyValues?: (hints: string[]) => Promise<Record<string, string>>;
}

interface Navigator {
  userAgentData?: NavigatorUAData;
}

// Расширим наш тип для DeviceInfo
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
  uaData?: NavigatorUAData;
}
