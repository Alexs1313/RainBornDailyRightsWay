import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RainBornRoutes from './RainBornDailyRightsWay/RainBornNavigation/RainBornRoutes';
import { StoreProvider } from './RainBornDailyRightsWay/RainBornStore.tsx/rainBornContext';

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <StoreProvider>
        <RainBornRoutes />
      </StoreProvider>
    </NavigationContainer>
  );
};

export default App;
