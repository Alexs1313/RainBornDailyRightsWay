// loader
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RainBornRoutesList } from '../../RainWaystckrotes';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  StyleSheet,
  View,
} from 'react-native';

type NavigationProp = StackNavigationProp<RainBornRoutesList, 'RainBornLoader'>;

const LOADER_DURATION_MS = 5000;

const RainBornLoader: React.FC = () => {
  const dailyRightsNavigation = useNavigation<NavigationProp>();
  const dailyRightsSpinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dailyRightsLoop = Animated.loop(
      Animated.timing(dailyRightsSpinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    );
    dailyRightsLoop.start();
    return () => dailyRightsLoop.stop();
  }, [dailyRightsSpinAnim]);

  useEffect(() => {
    const dailyRightsTimeout = setTimeout(() => {
      dailyRightsNavigation.replace('RainBornOnboard');
    }, LOADER_DURATION_MS);
    return () => clearTimeout(dailyRightsTimeout);
  }, [dailyRightsNavigation]);

  const dailyRightsSpin = dailyRightsSpinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ImageBackground
      source={require('../RainBornAssets/images/bgs/onboard.png')}
      style={rainWayStyles.rainWayBackground}
      resizeMode="cover"
    >
      <View style={rainWayStyles.rainWayCentered}>
        <Animated.View
          style={[
            rainWayStyles.rainWayHorseshoeWrap,
            { transform: [{ rotate: dailyRightsSpin }] },
          ]}
        >
          <Image
            source={require('../RainBornAssets/images/hat.png')}
            style={rainWayStyles.rainWayHorseshoe}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

const rainWayStyles = StyleSheet.create({
  rainWayBackground: {
    flex: 1,
  },
  rainWayCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rainWayHorseshoeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rainWayHorseshoe: {
    width: 180,
    height: 280,
  },
});

export default RainBornLoader;
