import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from '@react-native-community/blur';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RainBornRoutesList } from '../RainBornNavigation/RainBornRoutes';
import Sound from 'react-native-sound';
import { useRainBornStore } from '../RainBornStore.tsx/rainBornContext';
import Orientation from 'react-native-orientation-locker';

type NavigationProp = StackNavigationProp<RainBornRoutesList, 'RainBornHome'>;

const STORAGE_KEY_PREFIX = '@RainBornDaily_';
const QUOTES = [
  "Today, it's enough to just start.",
  "Don't rush—the day is here.",
  "Take a step, even if you don't know where.",
  "You don't need to prove anything today.",
  'Start with what you have.',
  "The day doesn't demand more from you.",
  'Just be attentive.',
  'You can go slowly today.',
  "Don't look for a sign—here it is.",
  'Start without expectations.',
  'The day is not competing with you.',
  'A small step is also a step.',
  "Don't think too long.",
  'Start where you are.',
  'This moment is enough today.',
  "You don't need to know what will happen next.",
  'The day is already open.',
  'Start calmly.',
  'Just make the first move.',
  'Today is not about the result.',
  'The day is not in a hurry—and you can too.',
  'Start without a plan.',
  'Pay attention to the little things.',
  'Now is a good moment.',
  "Don't rush to change anything.",
  'Today you can be simpler.',
  'Start with silence.',
  'The day will set the pace.',
  'Just come into this day.',
  'Here and now is enough.',
];

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(d.getDate()).padStart(2, '0')}`;
}

function getQuoteForToday(): string {
  const key = getTodayKey();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % QUOTES.length;
  return QUOTES[index];
}

type MoodType = 'sad' | 'calm' | 'happy' | null;

interface MoodOption {
  key: MoodType;
  image: ImageSourcePropType;
  bg: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  {
    key: 'sad',
    image: require('../RainBornAssets/images/sad.png'),
    bg: '#350909',
  },
  {
    key: 'calm',
    image: require('../RainBornAssets/images/notbad.png'),
    bg: '#2D3509',
  },
  {
    key: 'happy',
    image: require('../RainBornAssets/images/good.png'),
    bg: '#093512',
  },
];

const RainBornHome: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [moodSelectedToday, setMoodSelectedToday] = useState<MoodType>(null);
  const [quoteShownToday, setQuoteShownToday] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodType>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [dailyQuote] = useState(() => getQuoteForToday());
  const [loaded, setLoaded] = useState(false);
  const [sound, setSound] = useState<Sound | null>(null);
  const [rainBornMusicIdx, setRainBornMusicIdx] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android' && modalVisible) {
        Orientation.lockToPortrait();
      }

      return () => Orientation.unlockAllOrientations();
    }, [modalVisible]),
  );

  const todayKey = getTodayKey();

  const loadDailyState = useCallback(async () => {
    try {
      const moodKey = `${STORAGE_KEY_PREFIX}mood_${todayKey}`;
      const quoteKey = `${STORAGE_KEY_PREFIX}quoteShown_${todayKey}`;
      const [mood, quoteShown] = await Promise.all([
        AsyncStorage.getItem(moodKey),
        AsyncStorage.getItem(quoteKey),
      ]);
      if (mood && (mood === 'sad' || mood === 'calm' || mood === 'happy')) {
        setMoodSelectedToday(mood as MoodType);
        setSelectedMood(mood as MoodType);
      }
      if (quoteShown === '1') setQuoteShownToday(true);
    } catch (_) {
    } finally {
      setLoaded(true);
    }
  }, [todayKey]);

  const rainBornTracksCycle: string[] = [
    'turtlebeats-calm-acoustic-quiet-quest-251658.mp3',
    'turtlebeats-calm-acoustic-quiet-quest-251658.mp3',
  ];
  const { rainBornSoundEnabled, setRainBornSoundEnabled } = useRainBornStore();

  useFocusEffect(
    useCallback(() => {
      loadRainBornBgMusic();
    }, []),
  );

  useEffect(() => {
    playRainBornMusic(rainBornMusicIdx);

    return () => {
      if (sound) {
        sound.stop(() => {
          sound.release();
        });
      }
    };
  }, [rainBornMusicIdx]);

  const playRainBornMusic = (index: number): void => {
    if (sound) {
      sound.stop(() => {
        sound.release();
      });
    }
    const rainBornTrackPath = rainBornTracksCycle[index];
    const newRainBornGameSound = new Sound(
      rainBornTrackPath,
      Sound.MAIN_BUNDLE,
      (error: Error | null) => {
        if (error) {
          console.log('Error =>', error);
          return;
        }
        newRainBornGameSound.play((success: boolean) => {
          if (success) {
            setRainBornMusicIdx(
              (prevIndex: number) =>
                (prevIndex + 1) % rainBornTracksCycle.length,
            );
          } else {
            console.log('Error =>');
          }
        });
        setSound(newRainBornGameSound);
      },
    );
  };

  useEffect(() => {
    const setVolumeRainBornMusic = async () => {
      try {
        const rainBornMusicValue = await AsyncStorage.getItem(
          'bg_app_music_enabled',
        );

        const isRainBornMusicOn = JSON.parse(rainBornMusicValue ?? 'true');
        setRainBornSoundEnabled(!!isRainBornMusicOn);
        if (sound) {
          sound.setVolume(isRainBornMusicOn ? 1 : 0);
        }
      } catch (error) {
        console.error('Error =>', error);
      }
    };

    setVolumeRainBornMusic();
  }, [sound]);

  useEffect(() => {
    if (sound) {
      sound.setVolume(rainBornSoundEnabled ? 1 : 0);
    }
  }, [rainBornSoundEnabled]);

  const loadRainBornBgMusic = async () => {
    try {
      const rainBornMusicValue = await AsyncStorage.getItem(
        'bg_app_music_enabled',
      );
      const isRainBornMusicOn = JSON.parse(rainBornMusicValue ?? 'true');
      setRainBornSoundEnabled(!!isRainBornMusicOn);
    } catch (error) {
      console.error('Error settings =>', error);
    }
  };

  useEffect(() => {
    loadDailyState();
  }, [loadDailyState]);

  const selectMood = useCallback(
    async (mood: MoodType) => {
      if (!mood) return;
      setSelectedMood(mood);
      setMoodSelectedToday(mood);
      try {
        await AsyncStorage.setItem(
          `${STORAGE_KEY_PREFIX}mood_${todayKey}`,
          mood,
        );
      } catch (_) {}
    },
    [todayKey],
  );

  const openQuoteModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const closeQuoteModal = useCallback(async () => {
    setModalVisible(false);
    setQuoteShownToday(true);
    try {
      await AsyncStorage.setItem(
        `${STORAGE_KEY_PREFIX}quoteShown_${todayKey}`,
        '1',
      );
    } catch (_) {}
  }, [todayKey]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: dailyQuote,
        title: 'Quote of the day',
      });
    } catch (_) {}
  }, [dailyQuote]);

  if (!loaded) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>...</Text>
      </View>
    );
  }

  if (moodSelectedToday === null) {
    return (
      <ImageBackground
        source={require('../RainBornAssets/images/bgs/main.png')}
        style={styles.background}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.moodContainer}>
            <View style={styles.banner}>
              <Image source={require('../RainBornAssets/images/moodTxt.png')} />
            </View>
            <View style={styles.moodButtons}>
              {MOOD_OPTIONS.map(({ key, image, bg }) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.moodButton, { backgroundColor: bg }]}
                  onPress={() => selectMood(key)}
                  activeOpacity={0.8}
                >
                  <Image source={image} style={styles.moodEmoji} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    );
  }

  // Step 2: main home with START TODAY or quote on screen
  return (
    <ImageBackground
      source={require('../RainBornAssets/images/bgs/main.png')}
      style={styles.background}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.mainContainer}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
              gap: 18,
              justifyContent: 'center',
            }}
          >
            <Image source={require('../RainBornAssets/images/homeLogo.png')} />
            {selectedMood &&
              (() => {
                const option = MOOD_OPTIONS.find(o => o.key === selectedMood);
                if (!option) return null;
                return (
                  <View style={styles.moodChipsRow}>
                    <View
                      style={[
                        styles.moodChip,
                        { backgroundColor: option.bg },
                        styles.moodChipSelected,
                      ]}
                    >
                      <Image
                        source={option.image}
                        style={styles.moodChipEmoji}
                      />
                    </View>
                  </View>
                );
              })()}
          </View>

          {/* Quote panel (after "Start Today" was used today) or placeholder */}
          {quoteShownToday ? (
            <View style={styles.quotePanel}>
              <Image
                source={require('../RainBornAssets/images/quoteimg.png')}
              />
              <Text style={styles.quotePanelText}>
                {dailyQuote.toUpperCase()}
              </Text>
            </View>
          ) : (
            <View style={styles.quotePlaceholder} />
          )}

          <View style={styles.buttonsStack}>
            {!quoteShownToday && (
              <TouchableOpacity onPress={openQuoteModal} activeOpacity={0.8}>
                <ImageBackground
                  source={require('../RainBornAssets/images/onboard/button.png')}
                  style={[
                    styles.onboardStyleButton,
                    { width: 334, height: 105 },
                  ]}
                >
                  <Image
                    source={require('../RainBornAssets/images/startbtn.png')}
                  />
                </ImageBackground>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('RainBornStories')}
            >
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={styles.onboardStyleButton}
              >
                <Image
                  source={require('../RainBornAssets/images/calmstrs.png')}
                />
              </ImageBackground>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('RainBornDailyLuck')}
            >
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={styles.onboardStyleButton}
              >
                <Image
                  source={require('../RainBornAssets/images/dailylck.png')}
                />
              </ImageBackground>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('RainBornPathJournal')}
            >
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={styles.onboardStyleButton}
              >
                <Image source={require('../RainBornAssets/images/pathj.png')} />
              </ImageBackground>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('RainBornSettings')}
            >
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={styles.onboardStyleButton}
              >
                <Image source={require('../RainBornAssets/images/sett.png')} />
              </ImageBackground>
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeQuoteModal}
          statusBarTranslucent={Platform.OS === 'android'}
        >
          {Platform.OS === 'ios' && (
            <BlurView
              blurAmount={1}
              blurType="light"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          )}
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={closeQuoteModal}
          >
            <TouchableOpacity
              style={styles.modalContent}
              activeOpacity={1}
              onPress={e => e.stopPropagation()}
            >
              <TouchableOpacity
                style={styles.modalClose}
                onPress={closeQuoteModal}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Image source={require('../RainBornAssets/images/cls.png')} />
              </TouchableOpacity>
              <View style={styles.modalCharacter}>
                <Image
                  source={require('../RainBornAssets/images/onboard/1.png')}
                />
              </View>
              <View style={styles.modalQuoteBox}>
                <Text style={styles.modalQuoteText}>
                  {dailyQuote.toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity onPress={handleShare} activeOpacity={0.8}>
                <ImageBackground
                  source={require('../RainBornAssets/images/onboard/button.png')}
                  style={styles.onboardStyleButton}
                >
                  <Image
                    source={require('../RainBornAssets/images/share.png')}
                  />
                </ImageBackground>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a3a1a',
  },
  loadingText: {
    color: '#fff',
    fontFamily: 'Nunito-Regular',
  },
  moodContainer: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  banner: {
    backgroundColor: '#123509',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginBottom: 80,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
  },
  moodButtons: {
    alignItems: 'center',
    gap: 20,
  },
  moodButton: {
    width: 111,
    height: 111,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodEmoji: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
  },
  mainContainer: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: 20,
  },
  moodChipsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  moodChip: {
    width: 101,
    height: 101,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodChipSelected: {
    borderColor: '#fff',
  },
  moodChipEmoji: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
  },
  quotePlaceholder: {
    minHeight: 24,
  },
  quotePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#123509',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 0,
  },
  quotePanelText: {
    flex: 1,
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    color: '#fff',
    letterSpacing: 0.3,
    marginLeft: 10,
  },
  buttonsStack: {
    gap: 12,
    alignItems: 'center',
  },
  onboardStyleButton: {
    width: 269,
    height: 84,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000D1',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  modalClose: {
    position: 'absolute',
    top: -22,
    right: 12,
    padding: 8,
  },
  modalCharacter: {},
  modalQuoteBox: {
    backgroundColor: '#123509',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginBottom: 24,
    width: '100%',
  },
  modalQuoteText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

export default RainBornHome;
