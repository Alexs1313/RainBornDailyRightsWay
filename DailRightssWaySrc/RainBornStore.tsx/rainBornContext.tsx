import React, { createContext, useMemo, useContext, useState } from 'react';

export interface RainBornStoreType {
  rainBornSoundEnabled: boolean;
  setRainBornSoundEnabled: (value: boolean) => void;
}

export const StoreContext = createContext<RainBornStoreType | undefined>(
  undefined,
);

export function useRainBornStore(): RainBornStoreType {
  const ctx = useContext(StoreContext);
  if (ctx === undefined) {
    throw new Error('useRainBornStore must be used within StoreProvider');
  }
  return ctx;
}

export interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [rainBornSoundEnabled, setRainBornSoundEnabled] = useState<boolean>(
    false,
  );

  const value = useMemo<RainBornStoreType>(
    () => ({
      rainBornSoundEnabled,
      setRainBornSoundEnabled,
    }),
    [rainBornSoundEnabled],
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};
