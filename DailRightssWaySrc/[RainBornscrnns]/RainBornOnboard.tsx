// onboard

import TouchableOpacity from '../[RainBorncmpnts]/RainBornAnimatedTouchable';
import type { StackNavigationProp } from '@react-navigation/stack';

import { useNavigation } from '@react-navigation/native';

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import type { RainBornRoutesList } from '../../RainWaystckrotes';

type NavigationProp = StackNavigationProp<
  RainBornRoutesList,
  'RainBornOnboard'
>;

const onboardImages: ImageSourcePropType[] = [
  require('../RainBornAssets/images/onboard/1.png'),
  require('../RainBornAssets/images/onboard/2.png'),
  require('../RainBornAssets/images/onboard/3.png'),
  require('../RainBornAssets/images/onboard/4.png'),
];

const onboardTexts: ImageSourcePropType[] = [
  require('../RainBornAssets/images/onboard/boardTxt1.png'),
  require('../RainBornAssets/images/onboard/boardTxt2.png'),
  require('../RainBornAssets/images/onboard/boardTxt3.png'),
  require('../RainBornAssets/images/onboard/boardTxt4.png'),
];

const onboardButtonTexts: ImageSourcePropType[] = [
  require('../RainBornAssets/images/onboard/btnTxt1.png'),
  require('../RainBornAssets/images/onboard/btnTxt2.png'),
  require('../RainBornAssets/images/onboard/btnTxt3.png'),
  require('../RainBornAssets/images/onboard/btnTxt4.png'),
];

const onboardDescriptions: string[] = [
  `This is a space for your daily mood. No rush, no rules, no unnecessary noise. Just a path that you walk at your own pace.`,
  `Every day is a small moment for yourself. A short action, a calm thought or a mood that you want to capture. No ratings. Just you and today.`,
  `No accounts or registrations. Everything is stored only on your device. This is your personal path — no one looks into it.`,
  `Take the first step. The leprechaun is here — not to guide, but to remind: luck begins with attention to the moment.`,
];

const RainBornOnboard: React.FC = () => {
  const [dailyRightsCurrentIndex, setDailyRightsCurrentIndex] = useState(0);
  const dailyRightsNavigation = useNavigation<NavigationProp>();
  const dailyRightsImageFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    dailyRightsImageFadeAnim.setValue(0);
    Animated.timing(dailyRightsImageFadeAnim, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [dailyRightsCurrentIndex, dailyRightsImageFadeAnim]);

  const handleRainBornNext = async () => {
    if (dailyRightsCurrentIndex < 3) {
      setDailyRightsCurrentIndex(prev => Math.min(prev + 1, 3));
      return;
    }

    dailyRightsNavigation.replace('RainBornHome');
  };

  return (
    <ImageBackground
      source={require('../RainBornAssets/images/bgs/onboard.png')}
      style={rainWayStyles.rainWayBackground}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingBottom: 55,
          }}
        >
          <Animated.Image
            source={onboardImages[dailyRightsCurrentIndex]}
            style={[
              rainWayStyles.rainWayOnboardImage,
              dailyRightsCurrentIndex === 0 && {
                top: 70,
              },
              dailyRightsCurrentIndex === 1 && { width: 300, height: 300 },
              { opacity: dailyRightsImageFadeAnim },
            ]}
          />

          <ImageBackground
            source={require('../RainBornAssets/images/onboard/textboard.png')}
            style={rainWayStyles.rainWayTextboard}
          >
            <Animated.Image
              source={onboardTexts[dailyRightsCurrentIndex]}
              style={{ opacity: dailyRightsImageFadeAnim }}
            />
            <Text style={rainWayStyles.rainWayTextboardText}>
              {onboardDescriptions[dailyRightsCurrentIndex]}
            </Text>
            <TouchableOpacity onPress={handleRainBornNext} activeOpacity={0.8}>
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={rainWayStyles.rainWayButton}
              >
                <Animated.Image
                  source={onboardButtonTexts[dailyRightsCurrentIndex]}
                  style={{ opacity: dailyRightsImageFadeAnim }}
                />
              </ImageBackground>
            </TouchableOpacity>
          </ImageBackground>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const rainWayStyles = StyleSheet.create({
  rainWayBackground: {
    flex: 1,
  },
  rainWayTextboard: {
    width: 386,
    height: 386,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  rainWayOnboardImage: {
    marginBottom: 20,
  },
  rainWayButton: {
    width: 236,
    height: 74,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  rainWayTextboardText: {
    fontSize: 13,
    fontFamily: 'Nunito-Regular',
    color: '#fff',
    paddingHorizontal: 85,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
});

export default RainBornOnboard;
