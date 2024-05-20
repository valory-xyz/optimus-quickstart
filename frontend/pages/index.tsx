import { useEffect, useMemo } from 'react';

import { Settings, Setup } from '@/components';
import { Main } from '@/components/Main/Main';
import { DEFAULT_HEIGHT, PageState } from '@/enums';
import { usePageState } from '@/hooks';
import { useElectronApi } from '@/hooks/useElectronApi';

export default function Home() {
  const { pageState } = usePageState();
  const { setAppHeight } = useElectronApi();

  useEffect(() => {
    function updateAppHeight() {
      const bodyElement = document.querySelector('body');
      if (bodyElement && setAppHeight) {
        const scrollHeight = bodyElement.scrollHeight;
        setAppHeight(Math.min(DEFAULT_HEIGHT, scrollHeight));
      }
    }

    const bodyElement = document.querySelector('body');
    if (!bodyElement) return;

    const observer = new MutationObserver(updateAppHeight);
    observer.observe(bodyElement, { childList: true, subtree: true });
    updateAppHeight();
  }, [setAppHeight]);

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
