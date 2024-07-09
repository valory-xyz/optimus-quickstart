import { useContext } from 'react';

import { PageStateContext } from '@/context/PageStateProvider';
import { PageState } from '@/enums/PageState';

export const usePageState = () => {
  const { pageState, setPageState } = useContext(PageStateContext);

  const goto = (state: PageState) => {
    setPageState(state);
  };

  return { pageState, setPageState, goto };
};
