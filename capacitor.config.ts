import { CapacitorConfig } from '@capacitor/cli';

/**
 * Конфигурация Capacitor для мобильного приложения
 * Capacitor позволяет упаковать веб-приложение в нативное мобильное приложение
 * @see https://capacitorjs.com/docs
 */

const config: CapacitorConfig = {
  appId: 'com.prayerdebt.tracker',
  appName: 'Prayer Debt Tracker',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // Для разработки можно использовать localhost
    // url: 'http://localhost:8080',
    // cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#4a3728',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#d4af37',
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#4a3728',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#d4af37',
      sound: 'beep.wav',
    },
  },
  android: {
    allowMixedContent: true,
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
  ios: {
    scheme: 'Prayer Debt Tracker',
    contentInset: 'automatic',
  },
};

export default config;

