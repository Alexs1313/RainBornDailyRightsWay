// settings

import type { RainBornRoutesList } from '../../RainWaystckrotes';
import { useRainBornStore } from '../RainBornStore.tsx/rainBornContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useRef } from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import TouchableOpacity from '../[RainBorncmpnts]/RainBornAnimatedTouchable';
import type { StackNavigationProp } from '@react-navigation/stack';

type NavigationProp = StackNavigationProp<
  RainBornRoutesList,
  'RainBornSettings'
>;

const RainBornSettings: React.FC = () => {
  const dailyRightsNavigation = useNavigation<NavigationProp>();
  const dailyRightsThumbAnim = useRef(new Animated.Value(1)).current;
  const { rainBornSoundEnabled, setRainBornSoundEnabled } = useRainBornStore();

  const toggleDailyRightsSound = async (dailyRightsSelectedValue: boolean) => {
    try {
      await AsyncStorage.setItem(
        'bg_app_music_enabled',
        JSON.stringify(dailyRightsSelectedValue),
      );
      setRainBornSoundEnabled(dailyRightsSelectedValue);
    } catch (error) {
      console.log('Error', error);
    }
  };

  const resetDailyRightsData = async () => {
    try {
      const dailyRightsKeys = await AsyncStorage.getAllKeys();
      const dailyRightsRainKeys = dailyRightsKeys.filter(
        (dailyRightsKey: string) =>
          dailyRightsKey.startsWith('@RainBornDaily_'),
      );
      await AsyncStorage.multiRemove(dailyRightsRainKeys);
    } catch (_) {}
  };

  const dailyRightsThumbTranslateX = dailyRightsThumbAnim.interpolate({
    inputRange: [1, 10],
    outputRange: [1, 24],
  });

  return (
    <ImageBackground
      source={require('../RainBornAssets/images/settBg.png')}
      style={rainWayStyles.rainWayBackground}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          paddingBottom: 20,
        }}
      >
        <View style={rainWayStyles.rainWayHeader}>
          <TouchableOpacity
            onPress={() => dailyRightsNavigation.goBack()}
            activeOpacity={0.8}
            style={rainWayStyles.rainWayHeaderBack}
          >
            <Image source={require('../RainBornAssets/images/back.png')} />
          </TouchableOpacity>
          <Image source={require('../RainBornAssets/images/settttl.png')} />
        </View>

        <View style={{ width: '100%', alignItems: 'center' }}>
          {Platform.OS === 'ios' && (
            <View style={rainWayStyles.rainWayPanel}>
              <Image source={require('../RainBornAssets/images/mus.png')} />
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => toggleDailyRightsSound(!rainBornSoundEnabled)}
                style={rainWayStyles.rainWaySwitchTrack}
              >
                <Animated.View
                  style={[
                    rainWayStyles.rainWaySwitchThumb,
                    rainBornSoundEnabled
                      ? { backgroundColor: '#59d102', left: 22 }
                      : { backgroundColor: '#D9D9D9' },
                    {
                      transform: [{ translateX: dailyRightsThumbTranslateX }],
                    },
                  ]}
                />
              </TouchableOpacity>
            </View>
          )}

          <View
            style={[
              rainWayStyles.rainWayPanelAbout,
              { marginTop: Platform.OS === 'ios' ? 0 : 20 },
            ]}
          >
            <Image source={require('../RainBornAssets/images/aboutapp.png')} />
            <Text style={rainWayStyles.rainWayAboutText}>
              A calm daily app for short moments of attention. Every day you
              open one symbol and receive a simple action — no choices, no rush,
              no ratings. You can leave a short note, read a gentle story, or
              simply pause for a few seconds. No accounts or registrations.
              Everything is stored only on your device. Designed for those who
              want less noise and more presence in the moment.
            </Text>
          </View>

          <TouchableOpacity
            onPress={resetDailyRightsData}
            activeOpacity={0.8}
            style={rainWayStyles.rainWayResetButtonWrap}
          >
            <ImageBackground
              source={require('../RainBornAssets/images/onboard/button.png')}
              style={rainWayStyles.rainWayOnboardStyleButton}
            >
              <Image source={require('../RainBornAssets/images/reset.png')} />
            </ImageBackground>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const rainWayStyles = StyleSheet.create({
  rainWayBackground: { flex: 1 },
  rainWayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#123509',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: Platform.OS === 'android' ? 50 : 60,
    marginHorizontal: 16,
    borderRadius: 6,
    gap: 10,
    minHeight: 66,
    width: '86%',
    alignSelf: 'center',
  },
  rainWayHeaderBack: { position: 'absolute', left: 16 },

  rainWayProfilePanel: {
    backgroundColor: '#350909',
    borderRadius: 6,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#fff',
    width: '86%',
    marginTop: 2,
    alignItems: 'center',
  },
  rainWayProfileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 32,
    marginBottom: 12,
  },
  rainWayProfileLabel: {
    color: '#fff',
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginTop: 10,
  },
  rainWayProfileInput: {
    width: '100%',
    backgroundColor: '#350909',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    color: '#fff',
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rainWayProfileHint: {
    color: '#fff',
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    marginTop: 12,
    opacity: 0.8,
  },
  rainWayPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#350909',
    borderRadius: 6,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#fff',
    width: '86%',
    marginTop: 30,
  },
  rainWaySwitchTrack: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  rainWaySwitchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#59d102',
  },
  rainWayPanelAbout: {
    backgroundColor: '#350909',
    borderRadius: 6,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#fff',
    width: '86%',
    paddingTop: 25,
  },
  rainWayAboutText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: '#fff',
    lineHeight: 19,
    marginTop: 12,
  },
  rainWayResetButtonWrap: { alignSelf: 'center' },
  rainWayOnboardStyleButton: {
    width: 236,
    height: 74,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
});

export default RainBornSettings;
