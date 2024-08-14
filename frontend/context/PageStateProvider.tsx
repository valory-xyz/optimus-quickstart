import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useState,
} from 'react';

import { Pages } from '@/enums/PageState';

type PageStateContextType = {
  pageState: Pages;
  setPageState: Dispatch<SetStateAction<Pages>>;
};

export const PageStateContext = createContext<PageStateContextType>({
  pageState: Pages.Setup,
  setPageState: () => {},
});

export const PageStateProvider = ({ children }: PropsWithChildren) => {
  const [pageState, setPageState] = useState(Pages.Setup);

  return (
    <PageStateContext.Provider value={{ pageState, setPageState }}>
      {children}
    </PageStateContext.Provider>
  );
};
