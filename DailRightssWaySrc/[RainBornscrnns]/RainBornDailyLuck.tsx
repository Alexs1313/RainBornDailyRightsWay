// daily luck

import type { RainBornRoutesList } from '../../RainWaystckrotes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import TouchableOpacity from '../[RainBorncmpnts]/RainBornAnimatedTouchable';
import type { StackNavigationProp } from '@react-navigation/stack';

type NavigationProp = StackNavigationProp<
  RainBornRoutesList,
  'RainBornDailyLuck'
>;

const STORAGE_KEY_PREFIX = '@RainBornDaily_';
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

const TASKS: string[] = [
  'Stop and look around for a few seconds.',
  'Notice the light near you.',
  'Look at something green or warm in color.',
  "Find one detail that you didn't notice before.",
  'Be still for a few seconds.',
  'Feel how you are sitting or standing right now.',
  'Pay attention to the sound around you.',
  'Touch something nearby and feel the texture.',
  'Look into the distance without focusing.',
  'Take a slow breath in and out.',
  'Feel the temperature of the air.',
  'Look at the shape of any object.',
  'Find something that seems calm.',
  'Let your gaze just glide.',
  'Take a few seconds to do nothing.',
  'Feel the support under your feet or body.',
  'Look at a shadow or a reflection of light.',
  'Listen to the silence between sounds.',
  'Touch something cold or warm.',
  'Be in this moment without thoughts.',
  'Pay attention to your breathing.',
  'Look at something familiar, as if for the first time.',
  'Feel the air coming in and out.',
  "Don't judge what you see.",
  'Let this moment last a little longer.',
  'Pay attention to the space around you.',
  'See where the object ends and the background begins.',
  'Feel that there is no need to rush now.',
  'Touch the surface next to you and let go.',
  'Just stay here for a few seconds.',
];

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(d.getDate()).padStart(2, '0')}`;
}

function getTaskIndexForToday(): number {
  const key = getTodayKey();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + key.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash |= 0;
  }
  return Math.abs(hash) % TASKS.length;
}

const SECONDS_24H = 24 * 60 * 60;

function formatCountdown(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(
    s,
  ).padStart(2, '0')}`;
}

function formatExecutionTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

type Step = 'intro' | 'loader' | 'task' | 'done' | 'cooldown';

const RainBornDailyLuck: React.FC = () => {
  const dailyRightsNavigation = useNavigation<NavigationProp>();
  const dailyRightsTodayKey = getTodayKey();
  const dailyRightsTaskIndex = getTaskIndexForToday();
  const dailyRightsTask = TASKS[dailyRightsTaskIndex];

  const [dailyRightsStep, setDailyRightsStep] = useState<Step>('intro');
  const [dailyRightsDoneToday, setDailyRightsDoneToday] = useState(false);
  const [dailyRightsLoaded, setDailyRightsLoaded] = useState(false);
  const [dailyRightsCooldownSeconds, setDailyRightsCooldownSeconds] =
    useState(SECONDS_24H);

  useEffect(() => {
    if (dailyRightsStep !== 'cooldown') return;
    const dailyRightsIntervalId = setInterval(() => {
      setDailyRightsCooldownSeconds(s => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(dailyRightsIntervalId);
  }, [dailyRightsStep]);

  const dailyRightsCooldownTimer = formatCountdown(dailyRightsCooldownSeconds);
  const [dailyRightsExecutionSeconds, setDailyRightsExecutionSeconds] =
    useState(0);
  const dailyRightsSpinAnim = useRef(new Animated.Value(0)).current;
  const dailyRightsExecutionInterval = useRef<ReturnType<
    typeof setInterval
  > | null>(null);
  const dailyRightsLoaderLoopRef = useRef<Animated.CompositeAnimation | null>(
    null,
  );

  useEffect(() => {
    // when dailyRightsTodayKey changes (once per day) reload state
    const fn = async () => {
      try {
        const dailyRightsDoneKey = `${STORAGE_KEY_PREFIX}dailyLuckDone_${dailyRightsTodayKey}`;
        const dailyRightsCooldownEndKey = `${STORAGE_KEY_PREFIX}dailyLuckCooldownEnd_${dailyRightsTodayKey}`;
        const [dailyRightsDone, dailyRightsCooldownEndRaw] = await Promise.all([
          AsyncStorage.getItem(dailyRightsDoneKey),
          AsyncStorage.getItem(dailyRightsCooldownEndKey),
        ]);
        const dailyRightsCooldownEndTs = Number(
          dailyRightsCooldownEndRaw ?? '0',
        );
        const dailyRightsRemainingSeconds = Math.max(
          0,
          Math.floor((dailyRightsCooldownEndTs - Date.now()) / 1000),
        );

        if (dailyRightsDone === '1' && dailyRightsRemainingSeconds > 0) {
          setDailyRightsDoneToday(true);
          setDailyRightsCooldownSeconds(dailyRightsRemainingSeconds);
        } else {
          setDailyRightsDoneToday(false);
          setDailyRightsCooldownSeconds(SECONDS_24H);
          await Promise.all([
            AsyncStorage.removeItem(dailyRightsDoneKey),
            AsyncStorage.removeItem(dailyRightsCooldownEndKey),
          ]);
        }
      } catch (_) {
      } finally {
        setDailyRightsLoaded(true);
      }
    };
    fn();
  }, [dailyRightsTodayKey]);

  const dailyRightsGoBack = () => {
    if (dailyRightsNavigation.canGoBack()) dailyRightsNavigation.goBack();
  };

  const onDailyRightsStart = () => {
    setDailyRightsStep('loader');
    dailyRightsSpinAnim.setValue(0);
    dailyRightsLoaderLoopRef.current = Animated.loop(
      Animated.timing(dailyRightsSpinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    );
    dailyRightsLoaderLoopRef.current.start();
  };

  useEffect(() => {
    if (dailyRightsStep !== 'loader') return;
    const dailyRightsLoaderTimeout = setTimeout(() => {
      dailyRightsLoaderLoopRef.current?.stop();
      setDailyRightsStep('task');
    }, 3000);
    return () => clearTimeout(dailyRightsLoaderTimeout);
  }, [dailyRightsStep]);

  useEffect(() => {
    if (dailyRightsStep !== 'task') return;
    dailyRightsExecutionInterval.current = setInterval(() => {
      setDailyRightsExecutionSeconds(s => s + 1);
    }, 1000);
    return () => {
      if (dailyRightsExecutionInterval.current)
        clearInterval(dailyRightsExecutionInterval.current);
    };
  }, [dailyRightsStep]);

  const onDailyRightsDone = async () => {
    setDailyRightsStep('done');
    setDailyRightsCooldownSeconds(SECONDS_24H);
    try {
      const dailyRightsCooldownEndTs = Date.now() + COOLDOWN_MS;
      await AsyncStorage.setItem(
        `${STORAGE_KEY_PREFIX}dailyLuckDone_${dailyRightsTodayKey}`,
        '1',
      );
      await AsyncStorage.setItem(
        `${STORAGE_KEY_PREFIX}dailyLuckCooldownEnd_${dailyRightsTodayKey}`,
        String(dailyRightsCooldownEndTs),
      );
    } catch (_) {}
    setDailyRightsDoneToday(true);
  };

  const onDailyRightsBackHome = () => {
    if (dailyRightsNavigation.canGoBack()) dailyRightsNavigation.goBack();
  };

  const handleDailyRightsShare = async () => {
    const dailyRightsMessage =
      dailyRightsStep === 'task'
        ? `Daily Luck Moment: ${dailyRightsTask}`
        : dailyRightsStep === 'done'
        ? `I spent ${dailyRightsExecutionSeconds} seconds on today's moment. That's enough for today. Come back tomorrow.`
        : '';
    try {
      await Share.share({
        message: dailyRightsMessage,
        title: 'Daily Luck Moment',
      });
    } catch (_) {}
  };

  const dailyRightsSpin = dailyRightsSpinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    if (
      dailyRightsLoaded &&
      dailyRightsDoneToday &&
      dailyRightsStep === 'intro'
    )
      setDailyRightsStep('cooldown');
  }, [dailyRightsLoaded, dailyRightsDoneToday, dailyRightsStep]);

  useEffect(() => {
    if (dailyRightsStep !== 'cooldown' || dailyRightsCooldownSeconds > 0)
      return;
    const dailyRightsDoneKey = `${STORAGE_KEY_PREFIX}dailyLuckDone_${dailyRightsTodayKey}`;
    const dailyRightsCooldownEndKey = `${STORAGE_KEY_PREFIX}dailyLuckCooldownEnd_${dailyRightsTodayKey}`;
    setDailyRightsDoneToday(false);
    setDailyRightsStep('intro');
    AsyncStorage.removeItem(dailyRightsDoneKey).catch(() => {});
    AsyncStorage.removeItem(dailyRightsCooldownEndKey).catch(() => {});
  }, [dailyRightsStep, dailyRightsCooldownSeconds, dailyRightsTodayKey]);

  const dailyRightsShowCooldown =
    dailyRightsDoneToday &&
    (dailyRightsStep === 'intro' || dailyRightsStep === 'cooldown');

  if (!dailyRightsLoaded) {
    return (
      <View style={rainWayStyles.rainWayCentered}>
        <Image source={require('../RainBornAssets/images/ldr.png')} />
      </View>
    );
  }

  const dailyRightsBackgroundSource =
    dailyRightsStep === 'task' || dailyRightsStep === 'done'
      ? require('../RainBornAssets/images/bgs/onboard.png')
      : require('../RainBornAssets/images/bgs/main.png');

  return (
    <ImageBackground
      source={dailyRightsBackgroundSource}
      style={rainWayStyles.rainWayBackground}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {dailyRightsStep !== 'task' && dailyRightsStep !== 'done' && (
          <View style={rainWayStyles.rainWayHeader}>
            <TouchableOpacity
              onPress={dailyRightsGoBack}
              activeOpacity={0.8}
              style={rainWayStyles.rainWayHeaderBack}
            >
              <Image source={require('../RainBornAssets/images/back.png')} />
            </TouchableOpacity>
            <Image source={require('../RainBornAssets/images/luckmmnt.png')} />
          </View>
        )}

        {dailyRightsShowCooldown ? (
          <View style={rainWayStyles.rainWayCooldownBlock}>
            <View style={rainWayStyles.rainWayCooldownCard}>
              <View style={rainWayStyles.rainWayAttentionIconCircle}>
                <Text style={rainWayStyles.rainWayAttentionExclamation}>!</Text>
              </View>
              <Text style={rainWayStyles.rainWayCooldownTitle}>
                That's enough for today.
              </Text>
              <Text style={rainWayStyles.rainWayCooldownSubtitle}>
                Come back in:
              </Text>
              <Text style={rainWayStyles.rainWayCooldownTimer}>
                {dailyRightsCooldownTimer}
              </Text>
            </View>
          </View>
        ) : dailyRightsStep === 'intro' ? (
          <View style={rainWayStyles.rainWayIntroScreen}>
            <View style={rainWayStyles.rainWayIntroCard}>
              <View style={rainWayStyles.rainWayHorseshoeWrap}>
                <Image
                  source={require('../RainBornAssets/images/ldr.png')}
                  style={{ width: 120, height: 120 }}
                />
              </View>
              <Text style={rainWayStyles.rainWayIntroText}>
                Click to open today's moment.{'\n'}
                After starting, an item and a{'\n'}
                small task will appear.
              </Text>
              <TouchableOpacity
                onPress={onDailyRightsStart}
                activeOpacity={0.8}
              >
                <ImageBackground
                  source={require('../RainBornAssets/images/onboard/button.png')}
                  style={rainWayStyles.rainWayOnboardStyleButton}
                >
                  <Image
                    source={require('../RainBornAssets/images/strt.png')}
                  />
                </ImageBackground>
              </TouchableOpacity>
            </View>
          </View>
        ) : dailyRightsStep === 'loader' ? (
          <View style={rainWayStyles.rainWayLoaderScreen}>
            <Animated.View
              style={[
                rainWayStyles.rainWayHorseshoeLoader,
                { transform: [{ rotate: dailyRightsSpin }] },
              ]}
            >
              <Image
                source={require('../RainBornAssets/images/ldr.png')}
                style={{ width: 180, height: 280 }}
                resizeMode="contain"
              />
            </Animated.View>
          </View>
        ) : dailyRightsStep === 'task' ? (
          <View style={rainWayStyles.rainWayTaskScreen}>
            <View style={rainWayStyles.rainWayExecutionTimerBox}>
              <Image source={require('../RainBornAssets/images/time.png')} />
              <Text style={rainWayStyles.rainWayExecutionTimerValue}>
                {formatExecutionTime(dailyRightsExecutionSeconds)}
              </Text>
            </View>
            <View>
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/textboard.png')}
                style={rainWayStyles.rainWayTaskBg}
                resizeMode="contain"
              >
                <View style={rainWayStyles.rainWayTaskCard}>
                  <Image
                    source={require('../RainBornAssets/images/gametxt1.png')}
                  />
                  <Image
                    source={require('../RainBornAssets/images/hat.png')}
                    style={{ width: 110, height: 150 }}
                  />

                  <Text style={rainWayStyles.rainWayTaskLabel}>TASK:</Text>
                  <Text style={rainWayStyles.rainWayTaskText}>
                    {dailyRightsTask}
                  </Text>
                </View>
              </ImageBackground>
              <Image
                source={require('../RainBornAssets/images/storyimg.png')}
                style={{
                  position: 'absolute',
                  top: -140,
                  left: 20,
                }}
              />
            </View>
            <TouchableOpacity
              onPress={onDailyRightsDone}
              activeOpacity={0.8}
              style={rainWayStyles.rainWayTaskButtonWrap}
            >
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={rainWayStyles.rainWayOnboardStyleButton}
              >
                <Image source={require('../RainBornAssets/images/Done.png')} />
              </ImageBackground>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDailyRightsShare}
              activeOpacity={0.8}
              style={rainWayStyles.rainWayTaskButtonWrap}
            >
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={rainWayStyles.rainWayOnboardStyleButton}
              >
                <Image
                  source={require('../RainBornAssets/images/sharel.png')}
                />
              </ImageBackground>
            </TouchableOpacity>
          </View>
        ) : dailyRightsStep === 'done' ? (
          <View style={rainWayStyles.rainWayDoneScreen}>
            <Image
              source={require('../RainBornAssets/images/storyimg.png')}
              style={{
                alignSelf: 'center',
                top: 30,
              }}
            />
            <ImageBackground
              source={require('../RainBornAssets/images/onboard/textboard.png')}
              style={[rainWayStyles.rainWayTaskBg, { top: -60 }]}
              resizeMode="contain"
            >
              <View style={rainWayStyles.rainWayDoneCard}>
                <Image
                  source={require('../RainBornAssets/images/gametxt12.png')}
                />
                <Text style={rainWayStyles.rainWayDoneTime}>
                  Time spent on execution:{'\n'}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Nunito-Regular',
                    fontSize: 13,
                    color: '#FFFFFF',
                    textAlign: 'center',
                    marginBottom: 15,
                  }}
                >
                  {dailyRightsExecutionSeconds} seconds
                </Text>
                <TouchableOpacity
                  onPress={handleDailyRightsShare}
                  activeOpacity={0.8}
                  style={rainWayStyles.rainWayDoneButtonWrap}
                >
                  <ImageBackground
                    source={require('../RainBornAssets/images/onboard/button.png')}
                    style={rainWayStyles.rainWayOnboardStyleButton}
                  >
                    <Image
                      source={require('../RainBornAssets/images/sharel.png')}
                    />
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            </ImageBackground>
            <TouchableOpacity
              onPress={onDailyRightsBackHome}
              activeOpacity={0.8}
              style={[
                rainWayStyles.rainWayDoneButtonWrap,
                { top: -60, alignSelf: 'center' },
              ]}
            >
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={rainWayStyles.rainWayOnboardStyleButton}
              >
                <Image source={require('../RainBornAssets/images/backh.png')} />
              </ImageBackground>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </ImageBackground>
  );
};

const rainWayStyles = StyleSheet.create({
  rainWayBackground: { flex: 1 },
  rainWayCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a3a1a',
  },
  rainWayTaskBg: {
    width: 386,
    height: 386,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
    zIndex: 1,
  },
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
  rainWayHeaderBack: {
    position: 'absolute',
    left: 16,
  },
  rainWayCooldownBlock: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  rainWayCooldownCard: {
    backgroundColor: '#350909',
    borderRadius: 12,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    width: '90%',
    alignSelf: 'center',
    top: -50,
  },
  rainWayAttentionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  rainWayAttentionExclamation: {
    fontFamily: 'Nunito-Black',
    fontSize: 28,
    color: '#000',
  },
  rainWayCooldownTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    color: '#D9D9D9',
    marginBottom: 4,
    textAlign: 'center',
    marginTop: 14,
  },
  rainWayCooldownSubtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 15,
    color: '#D9D9D9',
    marginBottom: 8,
  },
  rainWayCooldownTimer: {
    fontFamily: 'Nunito-Black',
    fontSize: 28,
    color: '#FFFFFF',
    marginTop: 14,
  },
  rainWayIntroScreen: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  rainWayIntroCard: {
    backgroundColor: '#350909',
    borderRadius: 12,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    width: '90%',
    alignSelf: 'center',
    top: -50,
  },
  rainWayHorseshoeWrap: { marginBottom: 20 },
  rainWayIntroText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: '#D9D9D9',
    textAlign: 'center',
    marginBottom: 24,
  },
  rainWayLoaderScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rainWayHorseshoeLoader: { alignItems: 'center', justifyContent: 'center' },
  rainWayOnboardStyleButton: {
    width: 236,
    height: 74,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  rainWayTaskScreen: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  rainWayExecutionTimerBox: {
    alignSelf: 'flex-end',
    backgroundColor: '#123509',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
    minHeight: 90,
    justifyContent: 'center',
  },
  rainWayExecutionTimerValue: {
    fontFamily: 'Nunito-Black',
    fontSize: 20,
    color: '#FFF',
    marginTop: 7,
  },
  rainWayTaskCard: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rainWayTaskLabel: {
    fontFamily: 'Nunito-Black',
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  rainWayTaskText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: '#D9D9D9',
    marginBottom: 24,
  },
  rainWayTaskButtonWrap: { alignSelf: 'center', marginTop: 12 },
  rainWayDoneScreen: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  rainWayDoneCard: {
    paddingVertical: 30,
    paddingHorizontal: 50,
    alignItems: 'center',
  },
  rainWayDoneTime: {
    fontFamily: 'Nunito-Black',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 22,
  },
  rainWayDoneButtonWrap: { marginTop: 5 },
});

export default RainBornDailyLuck;
