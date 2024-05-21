import { get } from 'lodash';
import { createContext, PropsWithChildren } from 'react';

type ElectronApiContextProps = {
  setAppHeight?: (height: number) => void;
  closeApp?: () => void;
  minimizeApp?: () => void;
};

export const ElectronApiContext = createContext<ElectronApiContextProps>({
  setAppHeight: undefined,
  closeApp: undefined,
  minimizeApp: undefined,
});

const getElectronApiFunction = (functionNameInWindow: string) => {
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
        setAppHeight: getElectronApiFunction('setAppHeight'),
        closeApp: getElectronApiFunction('closeApp'),
        minimizeApp: getElectronApiFunction('minimizeApp'),
      }}
    >
      {children}
    </ElectronApiContext.Provider>
  );
};
