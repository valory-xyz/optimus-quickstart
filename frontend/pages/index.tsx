import { get, isFunction } from 'lodash';
import { useMemo } from 'react';

import { Settings, Setup } from '@/components';
import { Main } from '@/components/Main/Main';
import { PageHeights, PageState } from '@/enums';
import { usePageState } from '@/hooks';

export default function Home() {
  const { pageState } = usePageState();
  const setHeight =
    typeof window === 'undefined'
      ? null
      : get(window, 'electronAPI.setAppHeight');

  const page = useMemo(() => {
    const setHeightFn = isFunction(setHeight) ? setHeight : (e: number) => e;
    setHeightFn(PageHeights[pageState]);
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
