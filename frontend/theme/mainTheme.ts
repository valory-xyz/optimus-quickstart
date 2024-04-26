import { ThemeConfig } from 'antd';

export const mainTheme: ThemeConfig = {
  token: {
    colorPrimary: '#334155',
    colorWarning: '#FF9C27',
    colorText: '#0F172A ',
    colorFillSecondary: '#E4E4E4',
    fontSize: 20,
    fontFamily: 'Inter',
    colorBgContainer: '#FFFFFF',
  },
  components: {
    Alert: {
      fontSize: 16,
    },
    Card: {
      colorBgContainer: '#FFFFFF',
      padding: 20,
    },
    Button: {
      fontSize: 20,
    },
    Input: {
      fontSize: 20,
      colorTextDisabled: '#334155',
    },
    Tooltip: {
      fontSize: 16,
      colorText: 'black',
      colorTextLightSolid: 'black',
      colorBgSpotlight: 'white',
    },
  },
};
