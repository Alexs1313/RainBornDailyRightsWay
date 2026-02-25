import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import TouchableOpacity from '../RainBornComponents/RainBornAnimatedTouchable';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RainBornRoutesList } from '../../Roter';

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
    hash = (hash << 5) - hash + key.charCodeAt(i);
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
  const navigation = useNavigation<NavigationProp>();
  const todayKey = getTodayKey();
  const taskIndex = getTaskIndexForToday();
  const task = TASKS[taskIndex];

  const [step, setStep] = useState<Step>('intro');
  const [doneToday, setDoneToday] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(SECONDS_24H);

  useEffect(() => {
    if (step !== 'cooldown') return;
    const id = setInterval(() => {
      setCooldownSeconds(s => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  const cooldownTimer = formatCountdown(cooldownSeconds);
  const [executionSeconds, setExecutionSeconds] = useState(0);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const executionInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const loaderLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  const loadState = useCallback(async () => {
    try {
      const doneKey = `${STORAGE_KEY_PREFIX}dailyLuckDone_${todayKey}`;
      const cooldownEndKey = `${STORAGE_KEY_PREFIX}dailyLuckCooldownEnd_${todayKey}`;
      const [done, cooldownEndRaw] = await Promise.all([
        AsyncStorage.getItem(doneKey),
        AsyncStorage.getItem(cooldownEndKey),
      ]);
      const cooldownEndTs = Number(cooldownEndRaw ?? '0');
      const remainingSeconds = Math.max(
        0,
        Math.floor((cooldownEndTs - Date.now()) / 1000),
      );

      if (done === '1' && remainingSeconds > 0) {
        setDoneToday(true);
        setCooldownSeconds(remainingSeconds);
      } else {
        setDoneToday(false);
        setCooldownSeconds(SECONDS_24H);
        await Promise.all([
          AsyncStorage.removeItem(doneKey),
          AsyncStorage.removeItem(cooldownEndKey),
        ]);
      }
    } catch (_) {
    } finally {
      setLoaded(true);
    }
  }, [todayKey]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  const goBack = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
  }, [navigation]);

  const onStart = useCallback(() => {
    setStep('loader');
    spinAnim.setValue(0);
    loaderLoopRef.current = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    );
    loaderLoopRef.current.start();
  }, [spinAnim]);

  useEffect(() => {
    if (step !== 'loader') return;
    const t = setTimeout(() => {
      loaderLoopRef.current?.stop();
      setStep('task');
    }, 3000);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (step !== 'task') return;
    executionInterval.current = setInterval(() => {
      setExecutionSeconds(s => s + 1);
    }, 1000);
    return () => {
      if (executionInterval.current) clearInterval(executionInterval.current);
    };
  }, [step]);

  const onDone = useCallback(async () => {
    setStep('done');
    setCooldownSeconds(SECONDS_24H);
    try {
      const cooldownEndTs = Date.now() + COOLDOWN_MS;
      await AsyncStorage.setItem(
        `${STORAGE_KEY_PREFIX}dailyLuckDone_${todayKey}`,
        '1',
      );
      await AsyncStorage.setItem(
        `${STORAGE_KEY_PREFIX}dailyLuckCooldownEnd_${todayKey}`,
        String(cooldownEndTs),
      );
    } catch (_) {}
    setDoneToday(true);
  }, [todayKey]);

  const onBackHome = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
  }, [navigation]);

  const handleShare = useCallback(async () => {
    const message =
      step === 'task'
        ? `Daily Luck Moment: ${task}`
        : step === 'done'
        ? `I spent ${executionSeconds} seconds on today's moment. That's enough for today. Come back tomorrow.`
        : '';
    try {
      await Share.share({ message, title: 'Daily Luck Moment' });
    } catch (_) {}
  }, [step, task, executionSeconds]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    if (loaded && doneToday && step === 'intro') setStep('cooldown');
  }, [loaded, doneToday, step]);

  useEffect(() => {
    if (step !== 'cooldown' || cooldownSeconds > 0) return;
    const doneKey = `${STORAGE_KEY_PREFIX}dailyLuckDone_${todayKey}`;
    const cooldownEndKey = `${STORAGE_KEY_PREFIX}dailyLuckCooldownEnd_${todayKey}`;
    setDoneToday(false);
    setStep('intro');
    AsyncStorage.removeItem(doneKey).catch(() => {});
    AsyncStorage.removeItem(cooldownEndKey).catch(() => {});
  }, [step, cooldownSeconds, todayKey]);

  const showCooldown = doneToday && (step === 'intro' || step === 'cooldown');

  if (!loaded) {
    return (
      <View style={styles.centered}>
        <Image source={require('../RainBornAssets/images/ldr.png')} />
      </View>
    );
  }

  const backgroundSource =
    step === 'task' || step === 'done'
      ? require('../RainBornAssets/images/bgs/onboard.png')
      : require('../RainBornAssets/images/bgs/main.png');

  return (
    <ImageBackground source={backgroundSource} style={styles.background}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {step !== 'task' && step !== 'done' && (
          <View style={styles.header}>
            <TouchableOpacity
              onPress={goBack}
              activeOpacity={0.8}
              style={styles.headerBack}
            >
              <Image source={require('../RainBornAssets/images/back.png')} />
            </TouchableOpacity>
            <Image source={require('../RainBornAssets/images/luckmmnt.png')} />
          </View>
        )}

        {showCooldown ? (
          <View style={styles.cooldownBlock}>
            <View style={styles.cooldownCard}>
              <View style={styles.attentionIconCircle}>
                <Text style={styles.attentionExclamation}>!</Text>
              </View>
              <Text style={styles.cooldownTitle}>That's enough for today.</Text>
              <Text style={styles.cooldownSubtitle}>Come back in:</Text>
              <Text style={styles.cooldownTimer}>{cooldownTimer}</Text>
            </View>
          </View>
        ) : step === 'intro' ? (
          <View style={styles.introScreen}>
            <View style={styles.introCard}>
              <View style={styles.horseshoeWrap}>
                <Image
                  source={require('../RainBornAssets/images/hat.png')}
                  style={{ width: 150, height: 150 }}
                />
              </View>
              <Text style={styles.introText}>
                Click to open today's moment.{'\n'}
                After starting, an item and a{'\n'}
                small task will appear.
              </Text>
              <TouchableOpacity onPress={onStart} activeOpacity={0.8}>
                <ImageBackground
                  source={require('../RainBornAssets/images/onboard/button.png')}
                  style={styles.onboardStyleButton}
                >
                  <Image
                    source={require('../RainBornAssets/images/strt.png')}
                  />
                </ImageBackground>
              </TouchableOpacity>
            </View>
          </View>
        ) : step === 'loader' ? (
          <View style={styles.loaderScreen}>
            <Animated.View
              style={[
                styles.horseshoeLoader,
                { transform: [{ rotate: spin }] },
              ]}
            >
              <Image
                source={require('../RainBornAssets/images/hat.png')}
                style={{ width: 180, height: 280 }}
                resizeMode="contain"
              />
            </Animated.View>
          </View>
        ) : step === 'task' ? (
          <View style={styles.taskScreen}>
            <View style={styles.executionTimerBox}>
              <Image source={require('../RainBornAssets/images/time.png')} />
              <Text style={styles.executionTimerValue}>
                {formatExecutionTime(executionSeconds)}
              </Text>
            </View>
            <View>
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/textboard.png')}
                style={styles.taskBg}
                resizeMode="contain"
              >
                <View style={styles.taskCard}>
                  <Image
                    source={require('../RainBornAssets/images/gametxt1.png')}
                  />
                  <Image
                    source={require('../RainBornAssets/images/hat.png')}
                    style={{ width: 110, height: 150 }}
                  />

                  <Text style={styles.taskLabel}>TASK:</Text>
                  <Text style={styles.taskText}>{task}</Text>
                </View>
              </ImageBackground>
              <Image
                source={require('../RainBornAssets/images/lepricon.png')}
                style={{
                  position: 'absolute',
                  top: -140,
                  left: 20,
                  width: 180,
                  height: 280,
                }}
              />
            </View>
            <TouchableOpacity
              onPress={onDone}
              activeOpacity={0.8}
              style={styles.taskButtonWrap}
            >
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={styles.onboardStyleButton}
              >
                <Image source={require('../RainBornAssets/images/Done.png')} />
              </ImageBackground>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              activeOpacity={0.8}
              style={styles.taskButtonWrap}
            >
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={styles.onboardStyleButton}
              >
                <Image
                  source={require('../RainBornAssets/images/sharel.png')}
                />
              </ImageBackground>
            </TouchableOpacity>
          </View>
        ) : step === 'done' ? (
          <View style={styles.doneScreen}>
            <Image
              source={require('../RainBornAssets/images/lepricon.png')}
              style={{
                alignSelf: 'center',
                top: 30,
                width: 180,
                height: 280,
              }}
            />
            <ImageBackground
              source={require('../RainBornAssets/images/onboard/textboard.png')}
              style={[styles.taskBg, { top: -60 }]}
              resizeMode="contain"
            >
              <View style={styles.doneCard}>
                <Image
                  source={require('../RainBornAssets/images/gametxt12.png')}
                />
                <Text style={styles.doneTime}>
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
                  {executionSeconds} seconds
                </Text>
                <TouchableOpacity
                  onPress={handleShare}
                  activeOpacity={0.8}
                  style={styles.doneButtonWrap}
                >
                  <ImageBackground
                    source={require('../RainBornAssets/images/onboard/button.png')}
                    style={styles.onboardStyleButton}
                  >
                    <Image
                      source={require('../RainBornAssets/images/sharel.png')}
                    />
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            </ImageBackground>
            <TouchableOpacity
              onPress={onBackHome}
              activeOpacity={0.8}
              style={[styles.doneButtonWrap, { top: -60, alignSelf: 'center' }]}
            >
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={styles.onboardStyleButton}
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

const styles = StyleSheet.create({
  background: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a3a1a',
  },
  taskBg: {
    width: 386,
    height: 386,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
    zIndex: 1,
  },
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
  headerBack: {
    position: 'absolute',
    left: 16,
  },
  cooldownBlock: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  cooldownCard: {
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
  attentionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  attentionExclamation: {
    fontFamily: 'Nunito-Black',
    fontSize: 28,
    color: '#000',
  },
  cooldownTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    color: '#D9D9D9',
    marginBottom: 4,
    textAlign: 'center',
    marginTop: 14,
  },
  cooldownSubtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 15,
    color: '#D9D9D9',
    marginBottom: 8,
  },
  cooldownTimer: {
    fontFamily: 'Nunito-Black',
    fontSize: 28,
    color: '#FFFFFF',
    marginTop: 14,
  },
  introScreen: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  introCard: {
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
  horseshoeWrap: { marginBottom: 20 },
  introText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: '#D9D9D9',
    textAlign: 'center',
    marginBottom: 24,
  },
  loaderScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horseshoeLoader: { alignItems: 'center', justifyContent: 'center' },
  onboardStyleButton: {
    width: 236,
    height: 74,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  taskScreen: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  executionTimerBox: {
    alignSelf: 'flex-end',
    backgroundColor: '#123509',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
    minHeight: 90,
    justifyContent: 'center',
  },
  executionTimerValue: {
    fontFamily: 'Nunito-Black',
    fontSize: 20,
    color: '#FFF',
    marginTop: 7,
  },
  taskCard: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskLabel: {
    fontFamily: 'Nunito-Black',
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  taskText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: '#D9D9D9',
    marginBottom: 24,
  },
  taskButtonWrap: { alignSelf: 'center', marginTop: 12 },
  doneScreen: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  doneCard: {
    paddingVertical: 30,
    paddingHorizontal: 50,
    alignItems: 'center',
  },
  doneTime: {
    fontFamily: 'Nunito-Black',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 22,
  },
  doneButtonWrap: { marginTop: 5 },
});

export default RainBornDailyLuck;
