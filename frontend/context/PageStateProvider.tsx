import {
  SetStateAction,
  useState,
  Dispatch,
  createContext,
  PropsWithChildren,
} from 'react';

export enum PageState {
  Setup,
  Login,
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
