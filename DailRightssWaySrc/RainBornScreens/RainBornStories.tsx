import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from '@react-native-community/blur';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import TouchableOpacity from '../RainBornComponents/RainBornAnimatedTouchable';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RainBornRoutesList } from '../../Roter';
import Orientation from 'react-native-orientation-locker';

type NavigationProp = StackNavigationProp<
  RainBornRoutesList,
  'RainBornStories'
>;

interface TypingTextProps {
  text: string;
  typingSpeed?: number;
  showCursor?: boolean;
  cursorChar?: string;
  style?: StyleProp<TextStyle>;
  onComplete?: () => void;
  isActive?: boolean;
}

const TypingText: React.FC<TypingTextProps> = ({
  text,
  typingSpeed = 40,
  showCursor = true,
  cursorChar = '|',
  style,
  onComplete,
  isActive = true,
}) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isActive || displayedLength >= text.length) {
      if (displayedLength >= text.length && onCompleteRef.current) {
        onCompleteRef.current();
      }
      return;
    }
    const t = setTimeout(() => {
      setDisplayedLength(prev => Math.min(prev + 1, text.length));
    }, typingSpeed);
    return () => clearTimeout(t);
  }, [isActive, text, text.length, displayedLength, typingSpeed]);

  useEffect(() => {
    if (!showCursor) return;
    const id = setInterval(() => {
      setCursorVisible(v => !v);
    }, 530);
    return () => clearInterval(id);
  }, [showCursor]);

  const displayedText = text.slice(0, displayedLength);
  const isComplete = displayedLength >= text.length;

  return (
    <Text style={style}>
      {displayedText}
      {showCursor && !isComplete && (
        <Text
          style={[
            style,
            cursorVisible
              ? styles.typingCursorVisible
              : styles.typingCursorHidden,
          ]}
        >
          {cursorChar}
        </Text>
      )}
    </Text>
  );
};

const STORAGE_KEY_PREFIX = '@RainBornDaily_';

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(d.getDate()).padStart(2, '0')}`;
}

function getStoryIndexForToday(): number {
  const key = getTodayKey();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getStoryIndexForTodayWithUnlocked(unlockedCount: number): number {
  const key = getTodayKey();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % Math.max(1, unlockedCount);
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

interface StoryItem {
  title: string;
  excerpt: string;
  fullText: string;
}

const STORIES: StoryItem[] = [
  {
    title: 'The Quiet Step',
    excerpt:
      'There is a moment in every day when nothing asks for your attention. It is small and easy to miss.',
    fullText: `There is a moment in every day when nothing asks for your attention. It is small and easy to miss. No sound announces it, no sign points the way. It happens when you pause between two thoughts, or when your eyes rest on something ordinary and stop searching for more. In that moment, the world does not require decisions or answers. It simply exists, steady and calm.

Taking a quiet step does not mean stopping completely. It means allowing yourself to move without urgency. When you stop measuring progress and let go of comparison, the path becomes softer. You may notice how the air feels different, how light moves slowly across surfaces, how time stretches without pressure. This is not a pause from life — it is a way of being inside it.

The quiet step does not change the world, but it changes how you stand in it. And sometimes, that is enough.`,
  },
  {
    title: 'Where the Path Bends',
    excerpt:
      'Not every path moves straight ahead. Some turn without warning, some narrow, some seem to disappear for a while.',
    fullText: `Not every path moves straight ahead. Some turn without warning, some narrow, some seem to disappear for a while. When this happens, the instinct is often to stop and look back, searching for clarity or certainty. But paths are not designed to explain themselves. They exist to be walked, not understood all at once.

When the way bends, the pace naturally slows. Attention shifts from destination to movement. You start noticing what is close instead of what is far away. The ground under your feet, the sound of steps, the simple act of continuing. In these moments, progress is not measured by distance, but by presence.

A bending path is not a mistake. It is a reminder that forward does not always mean obvious. Sometimes it simply means staying with the step you are taking right now.`,
  },
  {
    title: 'The Still Place',
    excerpt:
      'Some places do not change, even when everything else does. They are not marked on maps and cannot be reached by direction alone.',
    fullText: `Some places do not change, even when everything else does. They are not marked on maps and cannot be reached by direction alone. They appear when you stop expecting something to happen. A still place is not empty — it is full in a quiet way.

In this place, thoughts slow down without being forced. There is no need to fix, improve, or prepare. You do not arrive here to become better; you arrive to remember that nothing is missing. The still place does not promise comfort or answers. It offers space. And in that space, things settle on their own.

You can leave this place at any time, and you will. But knowing it exists makes the movement forward lighter. You carry its calm with you, even when the day becomes loud again.`,
  },
];

const RainBornStories: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const todayKey = getTodayKey();
  const [currentLevel, setCurrentLevel] = useState(1);
  const unlockedStoriesCount = Math.max(
    1,
    Math.min(currentLevel, STORIES.length),
  );
  const storyIndex = getStoryIndexForTodayWithUnlocked(unlockedStoriesCount);
  const story = STORIES[storyIndex];

  const [readModalVisible, setReadModalVisible] = useState(false);
  const [storyReadToday, setStoryReadToday] = useState(false);
  const [attentionDismissedToday, setAttentionDismissedToday] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(SECONDS_24H);
  const prevStoryReadToday = useRef(false);

  useEffect(() => {
    if (storyReadToday && !prevStoryReadToday.current) {
      setCountdownSeconds(SECONDS_24H);
    }
    prevStoryReadToday.current = storyReadToday;
  }, [storyReadToday]);

  useEffect(() => {
    if (!storyReadToday) return;
    const id = setInterval(() => {
      setCountdownSeconds(s => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [storyReadToday]);

  const nextStoryTimer = formatCountdown(countdownSeconds);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android' && readModalVisible) {
        Orientation.lockToPortrait();
      }

      return () => Orientation.unlockAllOrientations();
    }, [readModalVisible]),
  );

  const loadState = useCallback(async () => {
    try {
      const [read, attentionDismissed, levelRaw] = await Promise.all([
        AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}storyRead_${todayKey}`),
        AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}storyAttention_${todayKey}`),
        AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}currentLevel`),
      ]);
      setStoryReadToday(read === '1');
      setAttentionDismissedToday(attentionDismissed === '1');
      const parsedLevel = Number(levelRaw ?? '1');
      if (
        Number.isFinite(parsedLevel) &&
        parsedLevel >= 1 &&
        parsedLevel <= 10
      ) {
        setCurrentLevel(parsedLevel);
      } else {
        setCurrentLevel(1);
      }
    } catch (_) {
      // ignore
    } finally {
      setLoaded(true);
    }
  }, [todayKey]);

  const dismissAttention = useCallback(async () => {
    setAttentionDismissedToday(true);
    try {
      await AsyncStorage.setItem(
        `${STORAGE_KEY_PREFIX}storyAttention_${todayKey}`,
        '1',
      );
    } catch (_) {}
  }, [todayKey]);

  useEffect(() => {
    loadState();
    // AsyncStorage.clear();
  }, [loadState]);

  const openReadModal = useCallback(() => {
    setReadModalVisible(true);
  }, []);

  const closeReadModal = useCallback(async () => {
    setReadModalVisible(false);
    setStoryReadToday(true);
    try {
      await AsyncStorage.setItem(
        `${STORAGE_KEY_PREFIX}storyRead_${todayKey}`,
        '1',
      );
    } catch (_) {}
  }, [todayKey]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        title: story.title,
        message: `${story.title}\n\n${story.fullText}`,
      });
    } catch (_) {}
  }, [story]);

  const goBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  if (!loaded) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../RainBornAssets/images/bgs/main.png')}
      style={styles.background}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={goBack}
            activeOpacity={0.8}
            style={{ position: 'absolute', left: 20 }}
          >
            <Image source={require('../RainBornAssets/images/back.png')} />
          </TouchableOpacity>
          <Image
            source={require('../RainBornAssets/images/calmstoryttl.png')}
          />
        </View>

        {!attentionDismissedToday ? (
          <View style={styles.attentionScreen}>
            <Image
              source={require('../RainBornAssets/images/lepricon.png')}
              style={{
                alignSelf: 'center',
                width: 200,
                height: 280,
              }}
            />
            <View style={styles.introBlock}>
              <View style={styles.attentionIconCircle}>
                <Text style={styles.attentionExclamation}>!</Text>
              </View>
              <Text style={styles.attentionTitle}>ATTENTION!</Text>
              <Text style={styles.attentionMessage}>
                Only one story is available for reading per day.
              </Text>
              <TouchableOpacity
                onPress={dismissAttention}
                activeOpacity={0.8}
                style={styles.attentionOkayButton}
              >
                <ImageBackground
                  source={require('../RainBornAssets/images/onboard/button.png')}
                  style={styles.onboardStyleButton}
                >
                  <Image
                    source={require('../RainBornAssets/images/okay.png')}
                  />
                </ImageBackground>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Step 2: Story card — READ opens full story in modal */
          <View style={styles.cardWrapper}>
            {storyReadToday && (
              <View style={styles.nextStoryRow}>
                <Image
                  source={require('../RainBornAssets/images/attent.png')}
                />
                <Text style={styles.nextStoryLabel}>
                  NEXT STORY: {nextStoryTimer}
                </Text>
              </View>
            )}

            <ImageBackground
              source={require('../RainBornAssets/images/onboard/textboard.png')}
              style={styles.storyBg}
              resizeMode="contain"
            >
              <View style={styles.storyCard}>
                <View>
                  <Text style={styles.storyCardTitle}>{story.title}</Text>
                  <Text style={styles.storyCardExcerpt}>{story.excerpt}</Text>
                </View>

                <TouchableOpacity
                  onPress={openReadModal}
                  activeOpacity={0.8}
                  style={styles.readButtonWrap}
                >
                  <ImageBackground
                    source={require('../RainBornAssets/images/onboard/button.png')}
                    style={styles.onboardStyleButton}
                  >
                    {storyReadToday ? (
                      <Image
                        source={require('../RainBornAssets/images/readaga.png')}
                      />
                    ) : (
                      <Image
                        source={require('../RainBornAssets/images/read.png')}
                      />
                    )}
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        )}

        {/* Read story modal */}
        <Modal
          visible={readModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeReadModal}
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
          <View style={styles.readModalOverlay}>
            <View style={styles.readModalContent}>
              <View style={styles.readModalHeader}>
                <Image
                  source={require('../RainBornAssets/images/readSt.png')}
                />
                <TouchableOpacity
                  onPress={closeReadModal}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={styles.readModalClose}
                >
                  <Image
                    source={require('../RainBornAssets/images/cls.png')}
                    style={styles.closeIcon}
                  />
                </TouchableOpacity>
              </View>
              <ScrollView
                style={styles.readModalScroll}
                contentContainerStyle={styles.readModalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Image
                  source={require('../RainBornAssets/images/bgs/main.png')}
                  style={styles.storyImage}
                  resizeMode="cover"
                />
                <Text style={styles.readModalStoryTitle}>{story.title}</Text>
                {readModalVisible && (
                  <TypingText
                    key={`typing-${story.title}-${todayKey}`}
                    text={story.fullText}
                    typingSpeed={12}
                    showCursor={true}
                    cursorChar="|"
                    style={styles.readModalStoryText}
                    isActive={readModalVisible}
                  />
                )}
              </ScrollView>
              <TouchableOpacity
                onPress={handleShare}
                activeOpacity={0.8}
                style={styles.shareButtonWrap}
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
          </View>
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
  storyBg: {
    width: 386,
    height: 386,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  attentionScreen: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  introBlock: {
    backgroundColor: '#350909',
    marginHorizontal: 0,
    borderRadius: 6,
    paddingVertical: 44,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    width: '90%',
    alignSelf: 'center',
    top: -80,
  },
  cardWrapper: {
    flex: 1,
    paddingTop: 34,
    alignItems: 'center',
  },
  storyCard: {
    width: '100%',
    maxWidth: 280,
    padding: 30,
  },
  storyCardTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: '#D9D9D9',
    marginBottom: 10,
  },
  storyCardExcerpt: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: '#D9D9D9',
    marginBottom: 10,
  },
  readButtonWrap: {
    alignSelf: 'center',
    marginTop: 10,
  },
  onboardStyleButton: {
    width: 236,
    height: 74,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  nextStoryRow: {
    marginTop: 16,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  nextStoryLabel: {
    fontFamily: 'Nunito-Black',
    fontSize: 15,
    color: '#000',
  },
  unlockedStoriesText: {
    fontFamily: 'Nunito-Black',
    fontSize: 13,
    color: '#fff',
    marginBottom: 10,
  },
  attentionIconCircle: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  attentionExclamation: {
    fontFamily: 'Nunito-Black',
    fontSize: 42,
    color: '#000',
  },
  attentionTitle: {
    fontFamily: 'Nunito-Black',
    fontSize: 24,
    color: '#fff',
    marginBottom: 8,
  },
  attentionMessage: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: '#D9D9D9',
    textAlign: 'center',
    width: '50%',
  },
  attentionOkayButton: {
    marginTop: 28,
  },
  readModalOverlay: {
    flex: 1,
    backgroundColor: '#000000D1',
    justifyContent: 'center',
    padding: 15,
  },
  readModalContent: {
    flex: 1,
    maxHeight: '90%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  readModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  readModalClose: {
    padding: 4,
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  readModalScroll: {
    flex: 1,
  },
  readModalScrollContent: {
    paddingBottom: 14,
  },
  storyImage: {
    marginTop: 24,
    width: '100%',
    height: 224,
    borderRadius: 10,
    marginBottom: 16,
  },
  readModalStoryTitle: {
    fontFamily: 'Nunito-Black',
    fontSize: 20,
    color: '#D9D9D9',
    marginBottom: 12,
  },
  readModalStoryText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: '#D9D9D9',
  },
  typingCursorVisible: {
    opacity: 1,
  },
  typingCursorHidden: {
    opacity: 0,
  },
  shareButtonWrap: {
    marginVertical: 16,
  },
});

export default RainBornStories;
