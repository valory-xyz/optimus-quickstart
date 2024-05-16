import { useMemo } from 'react';

import { Settings, Setup } from '@/components';
import { Main } from '@/components/Main/Main';
import { PageHeights, PageState } from '@/enums';
import { usePageState } from '@/hooks';
import { useElectronApi } from '@/hooks/useElectronApi';

export default function Home() {
  const { pageState } = usePageState();
  const { setHeight } = useElectronApi();

  const page = useMemo(() => {
    setHeight?.(PageHeights[pageState]);
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
  }, [pageState, setHeight]);

  return page;
}
