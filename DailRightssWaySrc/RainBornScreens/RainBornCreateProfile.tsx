import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
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

type NavigationProp = StackNavigationProp<
  RainBornRoutesList,
  'RainBornCreateProfile'
>;

const PROFILE_NAME_KEY = '@RainBornDaily_profile_name';
const PROFILE_PHOTO_KEY = '@RainBornDaily_profile_photo';

const RainBornCreateProfile: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [name, setName] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const continueShakeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const loadProfileDraft = async () => {
      try {
        const [savedName, savedPhoto] = await Promise.all([
          AsyncStorage.getItem(PROFILE_NAME_KEY),
          AsyncStorage.getItem(PROFILE_PHOTO_KEY),
        ]);
        if (savedName) setName(savedName);
        if (savedPhoto) setPhotoUri(savedPhoto);
      } catch (_) {}
    };
    loadProfileDraft();
  }, []);

  const onPickPhoto = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.9,
      });
      if (result.didCancel) return;
      const uri = result.assets?.[0]?.uri;
      if (uri) setPhotoUri(uri);
    } catch (_) {
      Alert.alert('Error', 'Unable to open photo library.');
    }
  }, []);

  const onContinue = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName || !photoUri) {
      continueShakeAnim.setValue(0);
      Animated.sequence([
        Animated.timing(continueShakeAnim, {
          toValue: 1,
          duration: 55,
          useNativeDriver: true,
        }),
        Animated.timing(continueShakeAnim, {
          toValue: -1,
          duration: 55,
          useNativeDriver: true,
        }),
        Animated.timing(continueShakeAnim, {
          toValue: 1,
          duration: 55,
          useNativeDriver: true,
        }),
        Animated.timing(continueShakeAnim, {
          toValue: -1,
          duration: 55,
          useNativeDriver: true,
        }),
        Animated.timing(continueShakeAnim, {
          toValue: 0,
          duration: 55,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }
    try {
      const pairs: [string, string][] = [[PROFILE_NAME_KEY, trimmedName]];
      if (photoUri) pairs.push([PROFILE_PHOTO_KEY, photoUri]);
      await AsyncStorage.multiSet(pairs);
      navigation.replace('RainBornHome');
    } catch (_) {
      Alert.alert('Error', 'Unable to save profile.');
    }
  }, [name, photoUri, navigation, continueShakeAnim]);

  return (
    <ImageBackground
      source={require('../RainBornAssets/images/bgs/main.png')}
      style={styles.background}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.header}>
          <Image source={require('../RainBornAssets/images/create.png')} />
        </View>

        <View style={styles.content}>
          <TouchableOpacity
            onPress={onPickPhoto}
            activeOpacity={0.85}
            style={styles.photoPickArea}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.profilePhoto} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Image
                  source={require('../RainBornAssets/images/camera.png')}
                  style={{ tintColor: '#fff', width: 30, height: 30 }}
                />
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="NICKNAME"
            placeholderTextColor="rgba(255,255,255,0.6)"
            style={styles.nameInput}
            maxLength={32}
          />
        </View>

        <Animated.View
          style={[
            styles.continueButton,
            {
              transform: [
                {
                  translateX: continueShakeAnim.interpolate({
                    inputRange: [-1, 1],
                    outputRange: [-8, 8],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity onPress={onContinue} activeOpacity={0.8}>
            <ImageBackground
              source={require('../RainBornAssets/images/onboard/button.png')}
              style={styles.onboardStyleButton}
            >
              <Image source={require('../RainBornAssets/images/okay.png')} />
            </ImageBackground>
          </TouchableOpacity>
        </Animated.View>
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
    height: 66,
    width: '86%',
    alignSelf: 'center',
  },
  headerBack: { position: 'absolute', left: 16 },
  headerTitle: {
    color: '#E87850',
    fontFamily: 'Nunito-Black',
    fontSize: 20,
    letterSpacing: 0.6,
  },
  content: {
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
  photoPickArea: {
    marginBottom: 18,
  },
  photoPlaceholder: {
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
  photoPlaceholderText: {
    color: '#FFFFFF',
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    textAlign: 'center',
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  nameInput: {
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
  continueButton: {
    alignSelf: 'center',
    marginTop: 30,
  },
  onboardStyleButton: {
    width: 236,
    height: 74,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  continueText: {
    fontSize: 24,
    color: 'rgba(169, 22, 0, 1)',
    fontFamily: 'Nunito-Black',
  },
});

export default RainBornCreateProfile;
