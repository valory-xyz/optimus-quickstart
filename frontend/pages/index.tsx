import { Card, Flex, Typography } from 'antd';
import { useMemo } from 'react';

import { Settings, Setup } from '@/components';
import { Balance } from '@/components/Main/Balance';
import { PageState } from '@/enums';
import { usePageState } from '@/hooks';

export default function Home() {
  const { pageState } = usePageState();
  const page = useMemo(() => {
    switch (pageState) {
      case PageState.Setup:
        return <Setup />;
      case PageState.Main:
        return <Main />;
      case PageState.Settings:
        return <Settings />;
      default:
        return <Main />;
    }
  }, [pageState]);

  return page;
}

const Main = () => {
  return (
    <Card>
      <Flex vertical>
        <Balance />
        <Typography
          style={{ display: 'flex', flexWrap: 'nowrap', fontSize: 18 }}
        >
          <span style={{ display: 'flex', flexWrap: 'nowrap' }}>
            24hr change -- %
          </span>
        </Typography>
      </Flex>
    </Card>
  );
};
