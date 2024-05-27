import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';

type OnlineStatusContextProps = {
  isOnline: boolean;
};

const initialState = {
  isOnline: true,
};

const OnlineStatusContext =
  createContext<OnlineStatusContextProps>(initialState);

const OnlineStatusProvider = ({ children }: PropsWithChildren) => {
  const [isOnline, setIsOnline] = useState(initialState.isOnline);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return (
    <OnlineStatusContext.Provider value={{ isOnline }}>
      {children}
    </OnlineStatusContext.Provider>
  );
};

export { OnlineStatusContext, OnlineStatusProvider };
