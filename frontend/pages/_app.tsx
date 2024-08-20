import '../styles/globals.scss';

import { ConfigProvider } from 'antd';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';

import { Layout } from '@/components/Layout';
import { BalanceProvider } from '@/context/BalanceProvider';
import { ElectronApiProvider } from '@/context/ElectronApiProvider';
import { MasterSafeProvider } from '@/context/MasterSafeProvider';
import { ModalProvider } from '@/context/ModalProvider';
import { OnlineStatusProvider } from '@/context/OnlineStatusProvider';
import { PageStateProvider } from '@/context/PageStateProvider';
import { RewardProvider } from '@/context/RewardProvider';
import { ServicesProvider } from '@/context/ServicesProvider';
import { SettingsProvider } from '@/context/SettingsProvider';
import { SetupProvider } from '@/context/SetupProvider';
import { StakingContractInfoProvider } from '@/context/StakingContractInfoProvider';
import { StakingProgramProvider } from '@/context/StakingProgramContext';
import { StoreProvider } from '@/context/StoreProvider';
import { WalletProvider } from '@/context/WalletProvider';
import { mainTheme } from '@/theme';

export default function App({ Component, pageProps }: AppProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <ElectronApiProvider>
      <StoreProvider>
        <PageStateProvider>
          <OnlineStatusProvider>
            <WalletProvider>
              <MasterSafeProvider>
                <ServicesProvider>
                  <RewardProvider>
                    <BalanceProvider>
                      <SetupProvider>
                        <SettingsProvider>
                          <StakingProgramProvider>
                            <StakingContractInfoProvider>
                              <ConfigProvider theme={mainTheme}>
                                <ModalProvider>
                                  {isMounted ? (
                                    <Layout>
                                      <Component {...pageProps} />
                                    </Layout>
                                  ) : null}
                                </ModalProvider>
                              </ConfigProvider>
                            </StakingContractInfoProvider>
                          </StakingProgramProvider>
                        </SettingsProvider>
                      </SetupProvider>
                    </BalanceProvider>
                  </RewardProvider>
                </ServicesProvider>
              </MasterSafeProvider>
            </WalletProvider>
          </OnlineStatusProvider>
        </PageStateProvider>
      </StoreProvider>
    </ElectronApiProvider>
  );
}
