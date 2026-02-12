import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RainBornLoader from '../RainBornScreens/RainBornLoader';
import RainBornOnboard from '../RainBornScreens/RainBornOnboard';
import RainBornHome from '../RainBornScreens/RainBornHome';
import RainBornStories from '../RainBornScreens/RainBornStories';
import RainBornDailyLuck from '../RainBornScreens/RainBornDailyLuck';
import RainBornPathJournal from '../RainBornScreens/RainBornPathJournal';
import RainBornSettings from '../RainBornScreens/RainBornSettings';

export type RainBornRoutesList = {
  RainBornLoader: undefined;
  RainBornOnboard: undefined;
  RainBornHome: undefined;
  RainBornStories: undefined;
  RainBornDailyLuck: undefined;
  RainBornPathJournal: undefined;
  RainBornSettings: undefined;
};

const Stack = createStackNavigator<RainBornRoutesList>();

const RainBornRoutes: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="RainBornLoader"
    >
      <Stack.Screen name="RainBornLoader" component={RainBornLoader} />
      <Stack.Screen name="RainBornOnboard" component={RainBornOnboard} />
      <Stack.Screen name="RainBornHome" component={RainBornHome} />
      <Stack.Screen name="RainBornStories" component={RainBornStories} />
      <Stack.Screen name="RainBornDailyLuck" component={RainBornDailyLuck} />
      <Stack.Screen name="RainBornPathJournal" component={RainBornPathJournal} />
      <Stack.Screen name="RainBornSettings" component={RainBornSettings} />
    </Stack.Navigator>
  );
};

export default RainBornRoutes;
