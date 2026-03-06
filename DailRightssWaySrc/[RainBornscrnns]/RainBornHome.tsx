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
import type { RainBornRoutesList } from '../../RainWaystckrotes';
import Sound from 'react-native-sound';
import { useRainBornStore } from '../RainBornStore.tsx/rainBornContext';
import Orientation from 'react-native-orientation-locker';

type NavigationProp = StackNavigationProp<RainBornRoutesList, 'RainBornHome'>;

const STORAGE_KEY_PREFIX = '@RainBornDaily_';
const PROFILE_NAME_KEY = '@RainBornDaily_profile_name';
const PROFILE_PHOTO_KEY = '@RainBornDaily_profile_photo';
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
    // use bitwise operations to produce a simple hash; disable lint rules
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + key.charCodeAt(i);

    hash |= 0;
  }
  const index = Math.abs(hash) % QUOTES.length;
  return QUOTES[index];
}

function getDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(d.getDate()).padStart(2, '0')}`;
}

function getCalendarDays(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startWeekday = first.getDay();
  const daysInMonth = last.getDate();
  const result: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) result.push(null);
  for (let d = 1; d <= daysInMonth; d++) result.push(d);
  return result;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

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
  const dailyRightsNavigation = useNavigation<NavigationProp>();
  const [dailyRightsMoodSelectedToday, setDailyRightsMoodSelectedToday] =
    useState<MoodType>(null);
  const [dailyRightsQuoteShownToday, setDailyRightsQuoteShownToday] =
    useState(false);
  const [dailyRightsSelectedMood, setDailyRightsSelectedMood] =
    useState<MoodType>(null);
  const [dailyRightsModalVisible, setDailyRightsModalVisible] = useState(false);
  const [dailyRightsDailyQuote] = useState(() => getQuoteForToday());

  const [sound, setSound] = useState<Sound | null>(null);
  const [rainBornMusicIdx, setRainBornMusicIdx] = useState(0);

  const rainBornTracksCycle: string[] = [
    'turtlebeats-calm-acoustic-quiet-quest-251658.mp3',
    'turtlebeats-calm-acoustic-quiet-quest-251658.mp3',
  ];
  const [dailyRightsMoodStatsVisible, setDailyRightsMoodStatsVisible] =
    useState(false);
  const [dailyRightsCalendarMonth, setDailyRightsCalendarMonth] = useState(
    () => new Date(),
  );
  const [dailyRightsSelectedStatsDate, setDailyRightsSelectedStatsDate] =
    useState<Date | null>(null);
  const [dailyRightsSelectedStatsMood, setDailyRightsSelectedStatsMood] =
    useState<MoodType>(null);
  const [dailyRightsProfileName, setDailyRightsProfileName] = useState('');
  const [dailyRightsProfilePhotoUri, setDailyRightsProfilePhotoUri] = useState<
    string | null
  >(null);
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
    const newRainBornMusicSound = new Sound(
      rainBornTrackPath,
      Sound.MAIN_BUNDLE,
      (error: Error | null) => {
        if (error) {
          console.log('Error =>', error);
          return;
        }
        newRainBornMusicSound.play((success: boolean) => {
          if (success) {
            setRainBornMusicIdx(
              (prevIndex: number) =>
                (prevIndex + 1) % rainBornTracksCycle.length,
            );
          } else {
            console.log('Error =>');
          }
        });
        setSound(newRainBornMusicSound);
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
      console.error('Error =>', error);
    }
  };

  // ------------------------>

  useFocusEffect(
    useCallback(() => {
      if (
        Platform.OS === 'android' &&
        (dailyRightsModalVisible || dailyRightsMoodStatsVisible)
      ) {
        Orientation.lockToPortrait();
      }

      return () => Orientation.unlockAllOrientations();
    }, [dailyRightsModalVisible, dailyRightsMoodStatsVisible]),
  );

  const dailyRightsTodayKey = getTodayKey();

  useEffect(() => {
    const fn = async () => {
      try {
        const dailyRightsMoodKey = `${STORAGE_KEY_PREFIX}mood_${dailyRightsTodayKey}`;
        const dailyRightsQuoteKey = `${STORAGE_KEY_PREFIX}quoteShown_${dailyRightsTodayKey}`;
        const [dailyRightsMood, dailyRightsQuoteShown] = await Promise.all([
          AsyncStorage.getItem(dailyRightsMoodKey),
          AsyncStorage.getItem(dailyRightsQuoteKey),
        ]);
        if (
          dailyRightsMood &&
          (dailyRightsMood === 'sad' ||
            dailyRightsMood === 'calm' ||
            dailyRightsMood === 'happy')
        ) {
          setDailyRightsMoodSelectedToday(dailyRightsMood as MoodType);
          setDailyRightsSelectedMood(dailyRightsMood as MoodType);
        }
        if (dailyRightsQuoteShown === '1') setDailyRightsQuoteShownToday(true);
      } catch (_) {
      } finally {
        // `dailyRightsLoaded` state removed; nothing to do here.
      }
    };
    fn();
  }, [dailyRightsTodayKey]);

  useFocusEffect(
    useCallback(() => {
      const fn = async () => {
        try {
          const [dailyRightsSavedName, dailyRightsSavedPhoto] =
            await Promise.all([
              AsyncStorage.getItem(PROFILE_NAME_KEY),
              AsyncStorage.getItem(PROFILE_PHOTO_KEY),
            ]);
          setDailyRightsProfileName(dailyRightsSavedName ?? '');
          setDailyRightsProfilePhotoUri(dailyRightsSavedPhoto ?? null);
        } catch (_) {
          setDailyRightsProfileName('');
          setDailyRightsProfilePhotoUri(null);
        }
      };
      fn();
    }, []),
  );

  const selectDailyRightsMood = async (dailyRightsMood: MoodType) => {
    if (!dailyRightsMood) return;
    setDailyRightsSelectedMood(dailyRightsMood);
    setDailyRightsMoodSelectedToday(dailyRightsMood);
    try {
      await AsyncStorage.setItem(
        `${STORAGE_KEY_PREFIX}mood_${dailyRightsTodayKey}`,
        dailyRightsMood,
      );
    } catch (_) {}
  };

  const openDailyRightsQuoteModal = () => {
    setDailyRightsModalVisible(true);
  };

  const closeDailyRightsQuoteModal = async () => {
    setDailyRightsModalVisible(false);
    setDailyRightsQuoteShownToday(true);
    try {
      await AsyncStorage.setItem(
        `${STORAGE_KEY_PREFIX}quoteShown_${dailyRightsTodayKey}`,
        '1',
      );
    } catch (_) {}
  };

  const handleDailyRightsShare = async () => {
    try {
      await Share.share({
        message: dailyRightsDailyQuote,
        title: 'Quote of the day',
      });
    } catch (_) {}
  };

  // function no longer called anywhere in the component; the various pieces of
  // its logic are either invoked directly where needed or are redundant. Keep
  // it if you plan to wire a "view stats" button later, otherwise remove.
  // const openDailyRightsMoodStats = async () => {
  //   const dailyRightsNow = new Date();
  //   setDailyRightsCalendarMonth(dailyRightsNow);
  //   setDailyRightsSelectedStatsDate(dailyRightsNow);
  //   try {
  //     const dailyRightsMood = await AsyncStorage.getItem(
  //       `${STORAGE_KEY_PREFIX}mood_${getDateKey(dailyRightsNow)}`,
  //     );
  //     if (
  //       dailyRightsMood === 'sad' ||
  //       dailyRightsMood === 'calm' ||
  //       dailyRightsMood === 'happy'
  //     ) {
  //       setDailyRightsSelectedStatsMood(dailyRightsMood);
  //     } else {
  //       setDailyRightsSelectedStatsMood(null);
  //     }
  //   } catch (_) {
  //     setDailyRightsSelectedStatsMood(null);
  //   }
  //   setDailyRightsMoodStatsVisible(true);
  // };

  const closeDailyRightsMoodStats = () => {
    setDailyRightsMoodStatsVisible(false);
  };

  const handleDailyRightsSelectStatsDate = async (dailyRightsDay: number) => {
    const dailyRightsDate = new Date(
      dailyRightsCalendarMonth.getFullYear(),
      dailyRightsCalendarMonth.getMonth(),
      dailyRightsDay,
    );
    setDailyRightsSelectedStatsDate(dailyRightsDate);
    try {
      const dailyRightsMood = await AsyncStorage.getItem(
        `${STORAGE_KEY_PREFIX}mood_${getDateKey(dailyRightsDate)}`,
      );
      if (
        dailyRightsMood === 'sad' ||
        dailyRightsMood === 'calm' ||
        dailyRightsMood === 'happy'
      ) {
        setDailyRightsSelectedStatsMood(dailyRightsMood);
      } else {
        setDailyRightsSelectedStatsMood(null);
      }
    } catch (_) {
      setDailyRightsSelectedStatsMood(null);
    }
  };

  if (dailyRightsMoodSelectedToday === null) {
    return (
      <ImageBackground
        source={require('../RainBornAssets/images/bgs/main.png')}
        style={rainWayStyles.rainWayBackground}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={rainWayStyles.rainWayMoodContainer}>
            <View style={rainWayStyles.rainWayBanner}>
              <Image source={require('../RainBornAssets/images/moodTxt.png')} />
            </View>
            <View style={rainWayStyles.rainWayMoodButtons}>
              {MOOD_OPTIONS.map(({ key, image, bg }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    rainWayStyles.rainWayMoodButton,
                    { backgroundColor: bg },
                  ]}
                  onPress={() => selectDailyRightsMood(key)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={image}
                    style={rainWayStyles.rainWayMoodEmoji}
                  />
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
      style={rainWayStyles.rainWayBackground}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={rainWayStyles.rainWayMainContainer}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
              justifyContent: 'space-between',
            }}
          >
            <View style={rainWayStyles.rainWayProfileWrap}>
              <Image
                source={
                  dailyRightsProfilePhotoUri
                    ? { uri: dailyRightsProfilePhotoUri }
                    : require('../RainBornAssets/images/180.png')
                }
                style={rainWayStyles.rainWayProfileAvatar}
              />
              {!!dailyRightsProfileName && (
                <View style={{ gap: 5 }}>
                  <Image
                    source={require('../RainBornAssets/images/goddday.png')}
                  />
                  <Text style={rainWayStyles.rainWayProfileGreetingText}>
                    {dailyRightsProfileName}
                  </Text>
                </View>
              )}
            </View>
            {dailyRightsSelectedMood &&
              (() => {
                const dailyRightsOption = MOOD_OPTIONS.find(
                  o => o.key === dailyRightsSelectedMood,
                );
                if (!dailyRightsOption) return null;
                return (
                  <View style={rainWayStyles.rainWayMoodChipsRow}>
                    <View
                      style={[
                        rainWayStyles.rainWayMoodChip,
                        { backgroundColor: dailyRightsOption.bg },
                        rainWayStyles.rainWayMoodChipSelected,
                      ]}
                    >
                      <Image
                        source={dailyRightsOption.image}
                        style={rainWayStyles.rainWayMoodChipEmoji}
                      />
                    </View>
                  </View>
                );
              })()}
          </View>

          {dailyRightsQuoteShownToday ? (
            <View style={rainWayStyles.rainWayQuotePanel}>
              <Image
                source={require('../RainBornAssets/images/quoteimg.png')}
              />
              <Text style={rainWayStyles.rainWayQuotePanelText}>
                {dailyRightsDailyQuote.toUpperCase()}
              </Text>
            </View>
          ) : (
            <View style={rainWayStyles.rainWayQuotePlaceholder} />
          )}

          <View style={rainWayStyles.rainWayButtonsStack}>
            {!dailyRightsQuoteShownToday && (
              <TouchableOpacity
                onPress={openDailyRightsQuoteModal}
                activeOpacity={0.8}
              >
                <ImageBackground
                  source={require('../RainBornAssets/images/onboard/button.png')}
                  style={[
                    rainWayStyles.rainWayOnboardStyleButton,
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
              onPress={() => dailyRightsNavigation.navigate('RainBornStories')}
            >
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={rainWayStyles.rainWayOnboardStyleButton}
              >
                <Image
                  source={require('../RainBornAssets/images/calmstrs.png')}
                />
              </ImageBackground>
            </TouchableOpacity>
            {/* <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => dailyRightsNavigation.navigate('RainBornLevels')}
            >
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={rainWayStyles.rainWayOnboardStyleButton}
              >
                <Image source={require('../RainBornAssets/images/play.png')} />
              </ImageBackground>
            </TouchableOpacity> */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                dailyRightsNavigation.navigate('RainBornDailyLuck')
              }
            >
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={rainWayStyles.rainWayOnboardStyleButton}
              >
                <Image
                  source={require('../RainBornAssets/images/dailylck.png')}
                />
              </ImageBackground>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                dailyRightsNavigation.navigate('RainBornPathJournal')
              }
            >
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={rainWayStyles.rainWayOnboardStyleButton}
              >
                <Image source={require('../RainBornAssets/images/pathj.png')} />
              </ImageBackground>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => dailyRightsNavigation.navigate('RainBornSettings')}
            >
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={rainWayStyles.rainWayOnboardStyleButton}
              >
                <Image source={require('../RainBornAssets/images/sett.png')} />
              </ImageBackground>
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          visible={dailyRightsModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeDailyRightsQuoteModal}
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
            style={rainWayStyles.rainWayModalOverlay}
            activeOpacity={1}
            onPress={closeDailyRightsQuoteModal}
          >
            <TouchableOpacity
              style={rainWayStyles.rainWayModalContent}
              activeOpacity={1}
              onPress={e => e.stopPropagation()}
            >
              <TouchableOpacity
                style={rainWayStyles.rainWayModalClose}
                onPress={closeDailyRightsQuoteModal}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Image source={require('../RainBornAssets/images/cls.png')} />
              </TouchableOpacity>
              <View style={rainWayStyles.rainWayModalCharacter}>
                <Image
                  source={require('../RainBornAssets/images/onboard/1.png')}
                />
              </View>
              <View style={rainWayStyles.rainWayModalQuoteBox}>
                <Text style={rainWayStyles.rainWayModalQuoteText}>
                  {dailyRightsDailyQuote.toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleDailyRightsShare}
                activeOpacity={0.8}
              >
                <ImageBackground
                  source={require('../RainBornAssets/images/onboard/button.png')}
                  style={rainWayStyles.rainWayOnboardStyleButton}
                >
                  <Image
                    source={require('../RainBornAssets/images/share.png')}
                  />
                </ImageBackground>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
        <Modal
          visible={dailyRightsMoodStatsVisible}
          transparent
          animationType="fade"
          onRequestClose={closeDailyRightsMoodStats}
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
            style={rainWayStyles.rainWayModalOverlay}
            activeOpacity={1}
            onPress={closeDailyRightsMoodStats}
          >
            <TouchableOpacity
              style={rainWayStyles.rainWayMoodStatsModalContent}
              activeOpacity={1}
              onPress={e => e.stopPropagation()}
            >
              <TouchableOpacity
                style={[
                  rainWayStyles.rainWayModalClose,
                  { top: -55, right: -5 },
                ]}
                onPress={closeDailyRightsMoodStats}
                hitSlop={{ top: 22, bottom: 12, left: 12, right: 12 }}
              >
                <Image source={require('../RainBornAssets/images/cls.png')} />
              </TouchableOpacity>
              <Image
                source={require('../RainBornAssets/images/rhythm.png')}
                style={{ marginBottom: 20 }}
              />
              <View style={rainWayStyles.rainWayCalendarBox}>
                <View style={rainWayStyles.rainWayCalendarBoxHeader}>
                  <Text style={rainWayStyles.rainWayCalendarMonthYear}>
                    {MONTH_NAMES[dailyRightsCalendarMonth.getMonth()]}{' '}
                    {dailyRightsCalendarMonth.getFullYear()}
                  </Text>
                  <View style={rainWayStyles.rainWayCalendarNav}>
                    <TouchableOpacity
                      onPress={() =>
                        setDailyRightsCalendarMonth(
                          new Date(
                            dailyRightsCalendarMonth.getFullYear(),
                            dailyRightsCalendarMonth.getMonth() - 1,
                          ),
                        )
                      }
                      style={rainWayStyles.rainWayCalendarNavBtn}
                    >
                      <Text style={rainWayStyles.rainWayCalendarNavArrow}>
                        ‹
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        setDailyRightsCalendarMonth(
                          new Date(
                            dailyRightsCalendarMonth.getFullYear(),
                            dailyRightsCalendarMonth.getMonth() + 1,
                          ),
                        )
                      }
                      style={rainWayStyles.rainWayCalendarNavBtn}
                    >
                      <Text style={rainWayStyles.rainWayCalendarNavArrow}>
                        ›
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={rainWayStyles.rainWayWeekdayRow}>
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                    <Text key={d} style={rainWayStyles.rainWayWeekdayCell}>
                      {d}
                    </Text>
                  ))}
                </View>
                <View style={rainWayStyles.rainWayDaysGrid}>
                  {getCalendarDays(
                    dailyRightsCalendarMonth.getFullYear(),
                    dailyRightsCalendarMonth.getMonth(),
                  ).map((d, i) => {
                    const dailyRightsIsSelected =
                      dailyRightsSelectedStatsDate &&
                      dailyRightsSelectedStatsDate.getDate() === d &&
                      dailyRightsSelectedStatsDate.getMonth() ===
                        dailyRightsCalendarMonth.getMonth() &&
                      dailyRightsSelectedStatsDate.getFullYear() ===
                        dailyRightsCalendarMonth.getFullYear();
                    if (d === null) {
                      return (
                        <View
                          key={`empty-${i}`}
                          style={rainWayStyles.rainWayDayCell}
                        />
                      );
                    }
                    return (
                      <TouchableOpacity
                        key={`day-${d}-${i}`}
                        style={rainWayStyles.rainWayDayCell}
                        onPress={() => handleDailyRightsSelectStatsDate(d)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            rainWayStyles.rainWayDayCellCircle,
                            dailyRightsIsSelected &&
                              rainWayStyles.rainWayDayCellSelectedCircle,
                          ]}
                        >
                          <Text
                            style={[
                              rainWayStyles.rainWayDayCellText,
                              dailyRightsIsSelected &&
                                rainWayStyles.rainWayDayCellTextSelected,
                            ]}
                          >
                            {d}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              {dailyRightsSelectedStatsDate ? (
                dailyRightsSelectedStatsMood ? (
                  <View style={rainWayStyles.rainWayStatsMoodResult}>
                    <Text style={rainWayStyles.rainWayStatsMoodDate}>
                      {dailyRightsSelectedStatsDate.toLocaleDateString('en-GB')}
                    </Text>
                    <View style={rainWayStyles.rainWayStatsMoodChip}>
                      <Image
                        source={
                          MOOD_OPTIONS.find(
                            o => o.key === dailyRightsSelectedStatsMood,
                          )!.image
                        }
                        style={rainWayStyles.rainWayStatsMoodEmoji}
                      />
                    </View>
                  </View>
                ) : (
                  <Text style={rainWayStyles.rainWayStatsMoodEmpty}>
                    No mood selected for this day
                  </Text>
                )
              ) : (
                <Text style={rainWayStyles.rainWayStatsMoodHint}>
                  Select a day to see saved mood
                </Text>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
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
    backgroundColor: '#1a3a1a',
  },
  rainWayLoadingText: {
    color: '#fff',
    fontFamily: 'Nunito-Regular',
  },
  rainWayMoodContainer: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  rainWayBanner: {
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
  rainWayMoodButtons: {
    alignItems: 'center',
    gap: 20,
  },
  rainWayMoodButton: {
    width: 111,
    height: 111,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rainWayMoodEmoji: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
  },
  rainWayMainContainer: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: 20,
  },
  rainWayProfileWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  rainWayProfileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 32,
  },
  rainWayProfileGreetingText: {
    color: 'rgb(59, 7, 7)',
    fontFamily: 'Nunito-Black',
    fontSize: 20,
    textAlign: 'left',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(255, 253, 253, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  rainWayMoodChipsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rainWayMoodChip: {
    width: 91,
    height: 91,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rainWayMoodChipSelected: {
    borderColor: '#fff',
  },
  rainWayMoodChipEmoji: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
  },
  rainWayQuotePlaceholder: {
    minHeight: 24,
  },
  rainWayQuotePanel: {
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
  rainWayQuotePanelText: {
    flex: 1,
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    color: '#fff',
    letterSpacing: 0.3,
    marginLeft: 10,
  },
  rainWayButtonsStack: {
    gap: 12,
    alignItems: 'center',
  },
  rainWayOnboardStyleButton: {
    width: 259,
    height: 74,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  rainWayModalOverlay: {
    flex: 1,
    backgroundColor: '#000000D1',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  rainWayModalContent: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  rainWayModalClose: {
    position: 'absolute',
    top: -22,
    right: 12,
    padding: 8,
  },
  rainWayModalCharacter: {},
  rainWayModalQuoteBox: {
    backgroundColor: '#123509',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginBottom: 24,
    width: '100%',
  },
  rainWayModalQuoteText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  rainWayMoodStatsButtonText: {
    fontFamily: 'Nunito-Black',
    fontSize: 24,
    color: 'rgba(169, 22, 0, 1)',
    letterSpacing: 0.5,
  },
  rainWayMoodStatsModalContent: {
    width: '95%',
    backgroundColor: '#123509',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 16,
    alignItems: 'center',
  },
  rainWayMoodStatsTitle: {
    fontFamily: 'Nunito-Black',
    fontSize: 20,
    color: '#fff',
    marginBottom: 12,
  },
  rainWayCalendarBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    width: '100%',
  },
  rainWayCalendarBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rainWayCalendarMonthYear: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: '#000',
  },
  rainWayCalendarNav: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rainWayCalendarNavBtn: { padding: 8 },
  rainWayCalendarNavArrow: {
    fontSize: 24,
    color: '#2196F3',
    fontFamily: 'Nunito-Bold',
  },
  rainWayWeekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  rainWayWeekdayCell: {
    flex: 1,
    fontFamily: 'Nunito-Regular',
    fontSize: 11,
    color: '#757575',
    textAlign: 'center',
  },
  rainWayDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rainWayDayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rainWayDayCellCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,

    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rainWayDayCellSelectedCircle: {
    backgroundColor: 'rgba(0, 123, 255, 0.12)',
  },
  rainWayDayCellText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 15,
    color: '#000',
  },
  rainWayDayCellTextSelected: {
    fontFamily: 'Nunito-Regular',
    color: '#007AFF',
  },
  rainWayStatsMoodHint: {
    marginTop: 16,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
  },
  rainWayStatsMoodEmpty: {
    marginTop: 16,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
  },
  rainWayStatsMoodResult: {
    marginTop: 14,
    alignItems: 'center',
    gap: 10,
  },
  rainWayStatsMoodDate: {
    color: '#fff',
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
  },
  rainWayStatsMoodChip: {
    width: 90,
    height: 90,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rainWayStatsMoodEmoji: {
    width: 54,
    height: 54,
    resizeMode: 'contain',
  },
});

export default RainBornHome;
