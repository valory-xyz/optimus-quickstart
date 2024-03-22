import {
  SetStateAction,
  useState,
  Dispatch,
  createContext,
  PropsWithChildren,
} from 'react';

export enum PageState {
  Main,
  Settings,
  Receive,
  Send,
}

type PageStateContextType = {
  pageState: PageState;
  setPageState: Dispatch<SetStateAction<PageState>>;
};

export const PageStateContext = createContext<PageStateContextType>({
  pageState: PageState.Main,
  setPageState: () => {},
});

export const PageStateProvider = ({ children }: PropsWithChildren) => {
  const [pageState, setPageState] = useState(PageState.Main);

  return (
    <PageStateContext.Provider value={{ pageState, setPageState }}>
      {children}
    </PageStateContext.Provider>
  );
};
