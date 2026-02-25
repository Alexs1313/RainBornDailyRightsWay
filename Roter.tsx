import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RainBornLoader from './DailRightssWaySrc/RainBornScreens/RainBornLoader';
import RainBornOnboard from './DailRightssWaySrc/RainBornScreens/RainBornOnboard';
import RainBornHome from './DailRightssWaySrc/RainBornScreens/RainBornHome';
import RainBornStories from './DailRightssWaySrc/RainBornScreens/RainBornStories';
import RainBornDailyLuck from './DailRightssWaySrc/RainBornScreens/RainBornDailyLuck';
import RainBornPathJournal from './DailRightssWaySrc/RainBornScreens/RainBornPathJournal';
import RainBornSettings from './DailRightssWaySrc/RainBornScreens/RainBornSettings';
import RainBornCreateProfile from './DailRightssWaySrc/RainBornScreens/RainBornCreateProfile';
import RainBornLevels from './DailRightssWaySrc/RainBornScreens/RainBornLevels';
import RainBornQuiz from './DailRightssWaySrc/RainBornScreens/RainBornQuiz';

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

const RainBornRoutes: React.FC = () => {
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

export default RainBornRoutes;
