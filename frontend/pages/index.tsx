import { useEffect, useMemo } from 'react';

import { Settings, Setup } from '@/components';
import { Main } from '@/components/Main/Main';
import { PageState } from '@/enums';
import { usePageState } from '@/hooks';
import { useElectronApi } from '@/hooks/useElectronApi';

export default function Home() {
  const { pageState } = usePageState();
  const { setHeight } = useElectronApi();

  useEffect(() => {
    console.log('Setting up height listener');

    // function updateHeight() {
    //   console.log('Updating height');

    //   const height = document.getElementById(
    //     'pearl-parent-container',
    //   )?.clientHeight;

    //   window?.console.log('Setting height:', height);
    //   if (!height || !setHeight) return;

    //   setHeight(Math.min(DEFAULT_HEIGHT, height));
    // }

    // window.addEventListener('resize', updateHeight);
    // return () => {
    //   window.removeEventListener('resize', updateHeight);
    // };

    function updateHeight() {
      const element = document.querySelector('body');
      if (element && setHeight) {
        const scrollHeight = element.scrollHeight;
        console.log('scrollHeight from PAGES', scrollHeight);
        setHeight(Math.min(735, scrollHeight));
        // ipcRenderer.send('element-height-changed', scrollHeight);
      }
    }

    const body = document.querySelector('body');
    if (!body) return;

    // Observe changes to the element's height
    const observer = new MutationObserver(updateHeight);
    // Observe changes in child elements and subtree
    observer.observe(body, { childList: true, subtree: true });
    // Initial height update
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
