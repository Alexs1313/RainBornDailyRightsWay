import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import TouchableOpacity from '../RainBornComponents/RainBornAnimatedTouchable';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RainBornRoutesList } from '../../Roter';

type NavigationProp = StackNavigationProp<
  RainBornRoutesList,
  'RainBornOnboard'
>;

const onboardImages: ImageSourcePropType[] = [
  require('../RainBornAssets/images/onboard/lepricon.png'),
  require('../RainBornAssets/images/onboard/hat.png'),
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

const PROFILE_NAME_KEY = '@RainBornDaily_profile_name';

const RainBornOnboard: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation<NavigationProp>();
  const imageFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    imageFadeAnim.setValue(0);
    Animated.timing(imageFadeAnim, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [currentIndex, imageFadeAnim]);

  const handleRainBornNext = useCallback(async () => {
    if (currentIndex < 3) {
      setCurrentIndex(prev => Math.min(prev + 1, 3));
      return;
    }

    try {
      const savedName = await AsyncStorage.getItem(PROFILE_NAME_KEY);
      if ((savedName ?? '').trim()) {
        navigation.replace('RainBornHome');
        return;
      }
    } catch (_) {}

    navigation.replace('RainBornCreateProfile');
  }, [currentIndex, navigation]);

  return (
    <ImageBackground
      source={require('../RainBornAssets/images/bgs/onboard.png')}
      style={styles.background}
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
            source={onboardImages[currentIndex]}
            style={[
              styles.onboardImage,
              currentIndex === 0 && { top: 160, width: 300, height: 420 },
              currentIndex === 1 && { width: 300, height: 300 },
              { opacity: imageFadeAnim },
            ]}
          />

          <ImageBackground
            source={require('../RainBornAssets/images/onboard/textboard.png')}
            style={styles.textboard}
          >
            <Animated.Image
              source={onboardTexts[currentIndex]}
              style={{ opacity: imageFadeAnim }}
            />
            <Text style={styles.textboardText}>
              {onboardDescriptions[currentIndex]}
            </Text>
            <TouchableOpacity onPress={handleRainBornNext} activeOpacity={0.8}>
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={styles.button}
              >
                <Animated.Image
                  source={onboardButtonTexts[currentIndex]}
                  style={{ opacity: imageFadeAnim }}
                />
              </ImageBackground>
            </TouchableOpacity>
          </ImageBackground>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  textboard: {
    width: 386,
    height: 386,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  onboardImage: {
    marginBottom: 20,
  },
  button: {
    width: 236,
    height: 74,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  textboardText: {
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
