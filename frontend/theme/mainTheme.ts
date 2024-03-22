import { ThemeConfig } from 'antd';

export const mainTheme: ThemeConfig = {
  token: {
    colorPrimary: '#334155',
    colorWarning: '#FF9C27',
    colorText: '#0F172A ',
    colorFillSecondary: '#E4E4E4',
    fontSize: 24,
    fontFamily: 'Inter',
  },
  components: {
    Alert: {
      colorWarningBg: 'transparent',
    },
    Button: {
      fontSize: 20,
    },
    QRCode: {
      size: 150,
    },
  },
};
