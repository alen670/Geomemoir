import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.geomemoir.app',
  appName: 'GeoMemoir',
  webDir: 'dist',
  server: {
    // 开发时用本地 Vite 服务器实现热重载
    // 生产构建时注释掉下面这行
    // url: 'http://192.168.31.30:3000',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
