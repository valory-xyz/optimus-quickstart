import { Typography } from 'antd';
import React from 'react';
import styled from 'styled-components';

import { COLOR } from '@/constants';

const { Text } = Typography;

const TrafficLightIcon = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-left: 8px;
`;

const RedLight = styled(TrafficLightIcon)`
  background-color: #fe5f57;
`;

const YellowLight = styled(TrafficLightIcon)`
  background-color: #febc2e;
`;

const GreenLight = styled(TrafficLightIcon)`
  background-color: #28c841;
`;

const TrafficLights = styled.div`
  display: flex;
  align-items: center;
  margin-right: 24px;
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
`;

export const TopBar = () => {
  return (
    <TopBarContainer>
      <TrafficLights>
        <RedLight />
        <YellowLight />
        <GreenLight />
      </TrafficLights>

      <Text>Olas Operate</Text>
    </TopBarContainer>
  );
};
