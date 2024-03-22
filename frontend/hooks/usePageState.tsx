import { PageStateContext } from '@/context/PageStateProvider';
import { useContext } from 'react';

export const usePageState = () => {
  const { pageState, setPageState } = useContext(PageStateContext);
  return { pageState, setPageState };
};
