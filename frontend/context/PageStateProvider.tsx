import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useState,
} from 'react';

import { PageState } from '@/enums';

type PageStateContextType = {
  pageState: PageState;
  setPageState: Dispatch<SetStateAction<PageState>>;
};

export const PageStateContext = createContext<PageStateContextType>({
  pageState: PageState.Setup,
  setPageState: () => {},
});

export const PageStateProvider = ({ children }: PropsWithChildren) => {
  const [pageState, setPageState] = useState(PageState.Setup);

  return (
    <PageStateContext.Provider value={{ pageState, setPageState }}>
      {children}
    </PageStateContext.Provider>
  );
};
