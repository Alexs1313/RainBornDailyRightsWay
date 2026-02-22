import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RainBornRoutesList } from '../RainBornNavigation/RainBornRoutes';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation<NavigationProp>();

  const handleRainBornNext = useCallback(() => {
    setCurrentIndex(prev => {
      const next = prev + 1;
      if (next > 3) navigation.navigate('RainBornHome');
      return Math.min(next, 3);
    });
  }, [navigation]);

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
          <Image
            source={onboardImages[currentIndex]}
            style={[styles.onboardImage, currentIndex === 0 && { top: 60 }]}
          />

          <ImageBackground
            source={require('../RainBornAssets/images/onboard/textboard.png')}
            style={styles.textboard}
          >
            <Image source={onboardTexts[currentIndex]} />
            <Text style={styles.textboardText}>
              {onboardDescriptions[currentIndex]}
            </Text>
            <TouchableOpacity onPress={handleRainBornNext} activeOpacity={0.8}>
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={styles.button}
              >
                <Image source={onboardButtonTexts[currentIndex]} />
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
