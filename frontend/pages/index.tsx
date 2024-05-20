import { useEffect, useMemo } from 'react';

import { Settings, Setup } from '@/components';
import { Main } from '@/components/Main/Main';
import { DEFAULT_HEIGHT, PageState } from '@/enums';
import { usePageState } from '@/hooks';
import { useElectronApi } from '@/hooks/useElectronApi';

export default function Home() {
  const { pageState } = usePageState();
  const { setHeight } = useElectronApi();

  useEffect(() => {
    function updateHeight() {
      const element = document.querySelector('body');
      if (element && setHeight) {
        const scrollHeight = element.scrollHeight;
        setHeight(Math.min(DEFAULT_HEIGHT, scrollHeight));
      }
    }

    const body = document.querySelector('body');
    if (!body) return;

    const observer = new MutationObserver(updateHeight);
    observer.observe(body, { childList: true, subtree: true });
    updateHeight();
  }, [setHeight]);

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
