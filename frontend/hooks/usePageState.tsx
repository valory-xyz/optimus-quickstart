import { useContext } from 'react';

import { PageStateContext } from '@/context';
import { PageState } from '@/enums';

export const usePageState = () => {
  const { pageState, setPageState } = useContext(PageStateContext);

  const goto = (state: PageState) => {
    setPageState(state);
  };

  return { pageState, setPageState, goto };
};
