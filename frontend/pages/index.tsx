import { useMemo } from 'react';

// import styled from 'styled-components';
import { Settings, Setup } from '@/components';
import { Main } from '@/components/Main/Main';
import { PageState } from '@/enums';
import { usePageState } from '@/hooks';

// const MainContainer = styled.div`
//   overflow: auto;
//   max-height: 552px;
// `;

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
  // return <MainContainer>{page}</MainContainer>;
}
