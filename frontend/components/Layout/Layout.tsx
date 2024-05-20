import { PropsWithChildren } from 'react';
import styled from 'styled-components';

import { COLOR } from '@/constants';

import { TopBar } from './TopBar';

const Container = styled.div`
  background-color: ${COLOR.WHITE};
  border-radius: 8px;
`;

export const Layout = ({
  children,
}: PropsWithChildren & { vertical?: boolean }) => {
  return (
    <Container id="pearl-parent-container">
      <TopBar />
      {children}
    </Container>
  );
};
