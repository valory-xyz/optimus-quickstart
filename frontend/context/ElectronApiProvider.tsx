import { get } from 'lodash';
import { createContext, PropsWithChildren } from 'react';

type ElectronApiContextProps = {
  setHeight?: (height: number) => void;
};

export const ElectronApiContext = createContext<ElectronApiContextProps>({
  setHeight: undefined,
});

const setHeight = (functionNameInWindow: string) => {
  if (typeof window === 'undefined') return;

  const fn = get(window, `electronAPI.${functionNameInWindow}`);
  if (!fn || typeof fn !== 'function') {
    throw new Error(
      `Function ${functionNameInWindow} not found in window.electronAPI`,
    );
  }

  return fn;
};

export const ElectronApiProvider = ({ children }: PropsWithChildren) => {
  return (
    <ElectronApiContext.Provider
      value={{
        setHeight: setHeight('setAppHeight'),
      }}
    >
      {children}
    </ElectronApiContext.Provider>
  );
};
