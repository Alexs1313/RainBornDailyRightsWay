import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import TouchableOpacity from '../RainBornComponents/RainBornAnimatedTouchable';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RainBornRoutesList } from '../../Roter';
import { useRainBornStore } from '../RainBornStore.tsx/rainBornContext';

type NavigationProp = StackNavigationProp<
  RainBornRoutesList,
  'RainBornSettings'
>;

const PROFILE_NAME_KEY = '@RainBornDaily_profile_name';
const PROFILE_PHOTO_KEY = '@RainBornDaily_profile_photo';

const RainBornSettings: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const thumbAnim = useRef(new Animated.Value(1)).current;
  const { rainBornSoundEnabled, setRainBornSoundEnabled } = useRainBornStore();
  const [profileName, setProfileName] = useState('');
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const [savedName, savedPhoto] = await Promise.all([
        AsyncStorage.getItem(PROFILE_NAME_KEY),
        AsyncStorage.getItem(PROFILE_PHOTO_KEY),
      ]);
      setProfileName(savedName ?? '');
      setProfilePhotoUri(savedPhoto ?? null);
    } catch (_) {
      setProfileName('');
      setProfilePhotoUri(null);
    }
  }, []);

  const toggleSound = useCallback(
    async (selectedValue: boolean): Promise<void> => {
      try {
        await AsyncStorage.setItem(
          'bg_app_music_enabled',
          JSON.stringify(selectedValue),
        );
        setRainBornSoundEnabled(selectedValue);
      } catch (error) {
        console.log('Error', error);
      }
    },
    [setRainBornSoundEnabled],
  );

  const goBack = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
  }, [navigation]);

  const onPickProfilePhoto = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.9,
      });
      if (result.didCancel) return;
      const uri = result.assets?.[0]?.uri;
      if (!uri) return;
      setProfilePhotoUri(uri);
      await AsyncStorage.setItem(PROFILE_PHOTO_KEY, uri);
    } catch (_) {
      Alert.alert('Error', 'Unable to open photo library.');
    }
  }, []);

  const onChangeProfileName = useCallback((text: string) => {
    setProfileName(text);
    AsyncStorage.setItem(PROFILE_NAME_KEY, text).catch(() => {});
  }, []);

  const resetData = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const rainKeys = keys.filter((k: string) =>
        k.startsWith('@RainBornDaily_'),
      );
      await AsyncStorage.multiRemove(rainKeys);
    } catch (_) {}

    navigation.replace('RainBornOnboard');
  }, [navigation]);

  useEffect(() => {
    thumbAnim.setValue(rainBornSoundEnabled ? 1 : 0);
  }, [rainBornSoundEnabled]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const thumbTranslateX = thumbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 24],
  });

  const handleToggleSound = useCallback(() => {
    const next = !rainBornSoundEnabled;
    Animated.timing(thumbAnim, {
      toValue: next ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    toggleSound(next);
  }, [rainBornSoundEnabled, thumbAnim]);

  return (
    <ImageBackground
      source={require('../RainBornAssets/images/settBg.png')}
      style={styles.background}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          paddingBottom: 20,
        }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={goBack}
            activeOpacity={0.8}
            style={styles.headerBack}
          >
            <Image source={require('../RainBornAssets/images/back.png')} />
          </TouchableOpacity>
          <Image source={require('../RainBornAssets/images/settttl.png')} />
        </View>

        <View style={{ width: '100%', alignItems: 'center' }}>
          {Platform.OS === 'ios' && (
            <View style={styles.panel}>
              <Image source={require('../RainBornAssets/images/mus.png')} />
              <TouchableOpacity
                activeOpacity={1}
                onPress={handleToggleSound}
                style={styles.switchTrack}
              >
                <Animated.View
                  style={[
                    styles.switchThumb,
                    rainBornSoundEnabled
                      ? { backgroundColor: '#59d102' }
                      : { backgroundColor: '#D9D9D9' },
                    {
                      transform: [{ translateX: thumbTranslateX }],
                    },
                  ]}
                />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.profilePanel}>
            <TouchableOpacity onPress={onPickProfilePhoto} activeOpacity={0.85}>
              <Image
                source={
                  profilePhotoUri
                    ? { uri: profilePhotoUri }
                    : require('../RainBornAssets/images/homeLogo.png')
                }
                style={styles.profileAvatar}
              />
            </TouchableOpacity>
            <Text style={styles.profileLabel}>Nickname:</Text>
            <TextInput
              value={profileName}
              onChangeText={onChangeProfileName}
              placeholder="Enter your name"
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={styles.profileInput}
              maxLength={32}
            />
          </View>

          <View
            style={[
              styles.panelAbout,
              { marginTop: Platform.OS === 'ios' ? 0 : 20 },
            ]}
          >
            <Image source={require('../RainBornAssets/images/aboutapp.png')} />
            <Text style={styles.aboutText}>
              RainBorn: Daily Rights Way is a calm daily app for short moments
              of attention. Every day you open one symbol and get a simple
              action — no choice, no rush, no ratings. Here you can leave a
              short note, read a gentle story or just stop for a few seconds.
              Rainbow Way is designed for those who want less noise and more
              presence in the moment.
            </Text>
          </View>

          <TouchableOpacity
            onPress={resetData}
            activeOpacity={0.8}
            style={styles.resetButtonWrap}
          >
            <ImageBackground
              source={require('../RainBornAssets/images/onboard/button.png')}
              style={styles.onboardStyleButton}
            >
              <Image source={require('../RainBornAssets/images/reset.png')} />
            </ImageBackground>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  header: {
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
  headerBack: { position: 'absolute', left: 16 },

  profilePanel: {
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
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 32,
    marginBottom: 12,
  },
  profileLabel: {
    color: '#fff',
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginTop: 10,
  },
  profileInput: {
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
  profileHint: {
    color: '#fff',
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    marginTop: 12,
    opacity: 0.8,
  },
  panel: {
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
  switchTrack: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#59d102',
  },
  panelAbout: {
    backgroundColor: '#350909',
    borderRadius: 6,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#fff',
    width: '86%',
    paddingTop: 25,
  },
  aboutText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: '#fff',
    lineHeight: 19,
    marginTop: 12,
  },
  resetButtonWrap: { alignSelf: 'center' },
  onboardStyleButton: {
    width: 236,
    height: 74,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
});

export default RainBornSettings;
