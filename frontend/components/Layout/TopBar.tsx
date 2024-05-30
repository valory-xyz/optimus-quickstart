import { Typography } from 'antd';
import styled from 'styled-components';

import { COLOR } from '@/constants';
import { useElectronApi } from '@/hooks/useElectronApi';
import { useStore } from '@/hooks/useStore';

const { Text } = Typography;

const TrafficLightIcon = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-left: 8px;
  -webkit-app-region: no-drag;
`;

const RedLight = styled(TrafficLightIcon)`
  background-color: #fe5f57;
`;

const YellowLight = styled(TrafficLightIcon)`
  background-color: #febc2e;
`;

const DisabledLight = styled(TrafficLightIcon)`
  background-color: #ddd;
`;

const TrafficLights = styled.div`
  display: flex;
  align-items: center;
  margin-right: 24px;
  -webkit-app-region: no-drag;
`;

const TopBarContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  padding: 10px 8px;
  border-radius: 8px 8px 0 0px;
  border-bottom: 1px solid ${COLOR.BORDER_GRAY};
  background: ${COLOR.WHITE};
  -webkit-app-region: drag;
`;

const isStaging = (version?: string) => {
  return !!version && (version.includes('alpha') || version.includes('beta'));
};

export const TopBar = () => {
  const electronApi = useElectronApi();
  const store = useStore();

  return (
    <TopBarContainer>
      <TrafficLights>
        <RedLight onClick={() => electronApi?.closeApp?.()} />
        <YellowLight onClick={() => electronApi?.minimizeApp?.()} />
        <DisabledLight />
      </TrafficLights>

      <Text>
        Pearl (alpha)
        {isStaging(store?.storeState?.appVersion) ? ' (staging)' : ''}
      </Text>
    </TopBarContainer>
  );
};
