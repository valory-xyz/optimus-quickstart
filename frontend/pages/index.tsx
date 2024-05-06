import { useMemo } from 'react';

import { Settings, Setup } from '@/components';
import { Main } from '@/components/Main/Main';
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
