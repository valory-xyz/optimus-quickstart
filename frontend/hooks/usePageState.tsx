import { PageState, PageStateContext } from '@/context/PageStateProvider';
import { useContext } from 'react';

export const usePageState = () => {
  const { pageState, setPageState } = useContext(PageStateContext);

  const goto = (state: PageState) => {
    setPageState(state);
  };

  return { pageState, setPageState, goto };
};
