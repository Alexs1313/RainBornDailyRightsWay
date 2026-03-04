// create profile

import TouchableOpacity from '../[RainBorncmpnts]/RainBornAnimatedTouchable';
import type { StackNavigationProp } from '@react-navigation/stack';

import type { RainBornRoutesList } from '../../RainWaystckrotes';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

type NavigationProp = StackNavigationProp<
  RainBornRoutesList,
  'RainBornCreateProfile'
>;

const dailyRightsProfileNameKey = '@RainBornDaily_profile_name';
const dailyRightsProfilePhotoKey = '@RainBornDaily_profile_photo';

const RainBornCreateProfile: React.FC = () => {
  const dailyRightsNavigation = useNavigation<NavigationProp>();
  const [dailyRightsName, setDailyRightsName] = useState('');
  const [dailyRightsPhotoUri, setDailyRightsPhotoUri] = useState<string | null>(
    null,
  );
  const dailyRightsContinueShakeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const loadDailyRightsProfileDraft = async () => {
      try {
        const [dailyRightsSavedName, dailyRightsSavedPhoto] = await Promise.all(
          [
            AsyncStorage.getItem(dailyRightsProfileNameKey),
            AsyncStorage.getItem(dailyRightsProfilePhotoKey),
          ],
        );
        if (dailyRightsSavedName) setDailyRightsName(dailyRightsSavedName);
        if (dailyRightsSavedPhoto)
          setDailyRightsPhotoUri(dailyRightsSavedPhoto);
      } catch (_) {}
    };
    loadDailyRightsProfileDraft();
  }, []);

  const onDailyRightsPickPhoto = useCallback(async () => {
    try {
      const dailyRightsPickResult = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.9,
      });
      if (dailyRightsPickResult.didCancel) return;
      const dailyRightsUri = dailyRightsPickResult.assets?.[0]?.uri;
      if (dailyRightsUri) setDailyRightsPhotoUri(dailyRightsUri);
    } catch (_) {
      Alert.alert('Error', 'Unable to open photo library.');
    }
  }, []);

  const onDailyRightsContinue = useCallback(async () => {
    const dailyRightsTrimmedName = dailyRightsName.trim();
    if (!dailyRightsTrimmedName || !dailyRightsPhotoUri) {
      dailyRightsContinueShakeAnim.setValue(0);
      Animated.sequence([
        Animated.timing(dailyRightsContinueShakeAnim, {
          toValue: 1,
          duration: 55,
          useNativeDriver: true,
        }),
        Animated.timing(dailyRightsContinueShakeAnim, {
          toValue: -1,
          duration: 55,
          useNativeDriver: true,
        }),
        Animated.timing(dailyRightsContinueShakeAnim, {
          toValue: 1,
          duration: 55,
          useNativeDriver: true,
        }),
        Animated.timing(dailyRightsContinueShakeAnim, {
          toValue: -1,
          duration: 55,
          useNativeDriver: true,
        }),
        Animated.timing(dailyRightsContinueShakeAnim, {
          toValue: 0,
          duration: 55,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }
    try {
      const dailyRightsPairs: [string, string][] = [
        [dailyRightsProfileNameKey, dailyRightsTrimmedName],
      ];
      if (dailyRightsPhotoUri) {
        dailyRightsPairs.push([
          dailyRightsProfilePhotoKey,
          dailyRightsPhotoUri,
        ]);
      }
      await AsyncStorage.multiSet(dailyRightsPairs);
      dailyRightsNavigation.replace('RainBornHome');
    } catch (_) {
      Alert.alert('Error', 'Unable to save profile.');
    }
  }, [
    dailyRightsName,
    dailyRightsPhotoUri,
    dailyRightsNavigation,
    dailyRightsContinueShakeAnim,
  ]);

  return (
    <ImageBackground
      source={require('../RainBornAssets/images/bgs/main.png')}
      style={rainWayStyles.rainWayBackground}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={rainWayStyles.rainWayScrollContent}
      >
        <View style={rainWayStyles.rainWayHeader}>
          <Image source={require('../RainBornAssets/images/create.png')} />
        </View>

        <View style={rainWayStyles.rainWayContent}>
          <TouchableOpacity
            onPress={onDailyRightsPickPhoto}
            activeOpacity={0.85}
            style={rainWayStyles.rainWayPhotoPickArea}
          >
            {dailyRightsPhotoUri ? (
              <Image
                source={{ uri: dailyRightsPhotoUri }}
                style={rainWayStyles.rainWayProfilePhoto}
              />
            ) : (
              <View style={rainWayStyles.rainWayPhotoPlaceholder}>
                <Image
                  source={require('../RainBornAssets/images/camera.png')}
                  style={rainWayStyles.rainWayCameraIcon}
                />
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            value={dailyRightsName}
            onChangeText={setDailyRightsName}
            placeholder="NICKNAME"
            placeholderTextColor="rgba(255,255,255,0.6)"
            style={rainWayStyles.rainWayNameInput}
            maxLength={32}
          />
        </View>

        <Animated.View
          style={[
            rainWayStyles.rainWayContinueButton,
            {
              transform: [
                {
                  translateX: dailyRightsContinueShakeAnim.interpolate({
                    inputRange: [-1, 1],
                    outputRange: [-8, 8],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity onPress={onDailyRightsContinue} activeOpacity={0.8}>
            <ImageBackground
              source={require('../RainBornAssets/images/onboard/button.png')}
              style={rainWayStyles.rainWayOnboardStyleButton}
            >
              <Image source={require('../RainBornAssets/images/okay.png')} />
            </ImageBackground>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </ImageBackground>
  );
};

const rainWayStyles = StyleSheet.create({
  rainWayBackground: { flex: 1 },
  rainWayScrollContent: { flexGrow: 1 },
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
    height: 66,
    width: '86%',
    alignSelf: 'center',
  },
  rainWayHeaderBack: { position: 'absolute', left: 16 },
  rainWayHeaderTitle: {
    color: '#E87850',
    fontFamily: 'Nunito-Black',
    fontSize: 20,
    letterSpacing: 0.6,
  },
  rainWayContent: {
    paddingHorizontal: 24,
    padding: 30,
    width: '84%',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 53, 9, 1)',
    borderRadius: 6,
    marginTop: 60,
    minHeight: 300,
  },
  rainWayPhotoPickArea: {
    marginBottom: 18,
  },
  rainWayPhotoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    backgroundColor: '#123509',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  rainWayPhotoPlaceholderText: {
    color: '#FFFFFF',
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    textAlign: 'center',
  },
  rainWayCameraIcon: {
    tintColor: '#fff',
    width: 30,
    height: 30,
  },
  rainWayProfilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  rainWayNameInput: {
    width: '100%',
    backgroundColor: '#123509',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    color: '#fff',
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 22,
    marginTop: 20,
  },
  rainWayContinueButton: {
    alignSelf: 'center',
    marginTop: 30,
  },
  rainWayOnboardStyleButton: {
    width: 236,
    height: 74,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  rainWayContinueText: {
    fontSize: 24,
    color: 'rgba(169, 22, 0, 1)',
    fontFamily: 'Nunito-Black',
  },
});

export default RainBornCreateProfile;
