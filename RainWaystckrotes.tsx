// router

import RainBornHome from './DailRightssWaySrc/[RainBornscrnns]/RainBornHome';
import RainBornStories from './DailRightssWaySrc/[RainBornscrnns]/RainBornStories';
import RainBornDailyLuck from './DailRightssWaySrc/[RainBornscrnns]/RainBornDailyLuck';
import RainBornPathJournal from './DailRightssWaySrc/[RainBornscrnns]/RainBornPathJournal';
import RainBornSettings from './DailRightssWaySrc/[RainBornscrnns]/RainBornSettings';
import RainBornCreateProfile from './DailRightssWaySrc/[RainBornscrnns]/RainBornCreateProfile';
import RainBornLevels from './DailRightssWaySrc/[RainBornscrnns]/RainBornLevels';
import RainBornQuiz from './DailRightssWaySrc/[RainBornscrnns]/RainBornQuiz';

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RainBornLoader from './DailRightssWaySrc/[RainBornscrnns]/RainBornLoader';
import RainBornOnboard from './DailRightssWaySrc/[RainBornscrnns]/RainBornOnboard';

export type RainBornRoutesList = {
  RainBornLoader: undefined;
  RainBornOnboard: undefined;
  RainBornCreateProfile: undefined;
  RainBornHome: undefined;
  RainBornLevels: undefined;
  RainBornQuiz: { level: number };
  RainBornStories: undefined;
  RainBornDailyLuck: undefined;
  RainBornPathJournal: undefined;
  RainBornSettings: undefined;
};

const Stack = createStackNavigator<RainBornRoutesList>();

const RainWaystckrotes: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="RainBornLoader"
    >
      <Stack.Screen name="RainBornLoader" component={RainBornLoader} />
      <Stack.Screen name="RainBornOnboard" component={RainBornOnboard} />
      <Stack.Screen
        name="RainBornCreateProfile"
        component={RainBornCreateProfile}
      />
      <Stack.Screen name="RainBornHome" component={RainBornHome} />
      <Stack.Screen name="RainBornLevels" component={RainBornLevels} />
      <Stack.Screen name="RainBornQuiz" component={RainBornQuiz} />
      <Stack.Screen name="RainBornStories" component={RainBornStories} />
      <Stack.Screen name="RainBornDailyLuck" component={RainBornDailyLuck} />
      <Stack.Screen
        name="RainBornPathJournal"
        component={RainBornPathJournal}
      />
      <Stack.Screen name="RainBornSettings" component={RainBornSettings} />
    </Stack.Navigator>
  );
};

export default RainWaystckrotes;
