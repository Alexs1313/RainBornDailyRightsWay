import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RainBornRoutes from './RainWaystckrotes';
import { StoreProvider } from './DailRightssWaySrc/RainBornStore.tsx/rainBornContext';

const CoreRborn: React.FC = () => {
  return (
    <NavigationContainer>
      <StoreProvider>
        <RainBornRoutes />
      </StoreProvider>
    </NavigationContainer>
  );
};

export default CoreRborn;
