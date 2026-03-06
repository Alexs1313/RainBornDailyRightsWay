import React, { createContext, useContext, useState } from 'react';

export interface RainBornStoreType {
  rainBornSoundEnabled: boolean;
  setRainBornSoundEnabled: (value: boolean) => void;
}

export const StoreContext = createContext<RainBornStoreType | undefined>(
  undefined,
);

export function useRainBornStore(): RainBornStoreType {
  const dailyRightsCtx = useContext(StoreContext);
  if (dailyRightsCtx === undefined) {
    throw new Error('useRainBornStore must be used within StoreProvider');
  }
  return dailyRightsCtx;
}

export interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [rainBornSoundEnabled, setRainBornSoundEnabled] =
    useState<boolean>(false);

  const value = {
    rainBornSoundEnabled,
    setRainBornSoundEnabled,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};
