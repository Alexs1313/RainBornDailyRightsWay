// stories scrn

import type { RainBornRoutesList } from '../../RainWaystckrotes';
import Orientation from 'react-native-orientation-locker';
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
import TouchableOpacity from '../[RainBorncmpnts]/RainBornAnimatedTouchable';
import type { StackNavigationProp } from '@react-navigation/stack';

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
  const [dailyRightsDisplayedLength, setDailyRightsDisplayedLength] =
    useState(0);
  const [dailyRightsCursorVisible, setDailyRightsCursorVisible] =
    useState(true);
  const dailyRightsOnCompleteRef = useRef(onComplete);
  dailyRightsOnCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isActive || dailyRightsDisplayedLength >= text.length) {
      if (
        dailyRightsDisplayedLength >= text.length &&
        dailyRightsOnCompleteRef.current
      ) {
        dailyRightsOnCompleteRef.current();
      }
      return;
    }
    const dailyRightsTimeout = setTimeout(() => {
      setDailyRightsDisplayedLength(prev => Math.min(prev + 1, text.length));
    }, typingSpeed);
    return () => clearTimeout(dailyRightsTimeout);
  }, [isActive, text, text.length, dailyRightsDisplayedLength, typingSpeed]);

  useEffect(() => {
    if (!showCursor) return;
    const dailyRightsIntervalId = setInterval(() => {
      setDailyRightsCursorVisible(v => !v);
    }, 530);
    return () => clearInterval(dailyRightsIntervalId);
  }, [showCursor]);

  const dailyRightsDisplayedText = text.slice(0, dailyRightsDisplayedLength);
  const dailyRightsIsComplete = dailyRightsDisplayedLength >= text.length;

  return (
    <Text style={style}>
      {dailyRightsDisplayedText}
      {showCursor && !dailyRightsIsComplete && (
        <Text
          style={[
            style,
            dailyRightsCursorVisible
              ? rainWayStyles.rainWayTypingCursorVisible
              : rainWayStyles.rainWayTypingCursorHidden,
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

function getStoryIndexForTodayWithUnlocked(unlockedCount: number): number {
  const key = getTodayKey();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + key.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
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
  const dailyRightsNavigation = useNavigation<NavigationProp>();
  const dailyRightsTodayKey = getTodayKey();
  const [dailyRightsCurrentLevel, setDailyRightsCurrentLevel] = useState(1);
  const dailyRightsUnlockedStoriesCount = Math.max(
    1,
    Math.min(dailyRightsCurrentLevel, STORIES.length),
  );
  const dailyRightsStoryIndex = getStoryIndexForTodayWithUnlocked(
    dailyRightsUnlockedStoriesCount,
  );
  const dailyRightsStory = STORIES[dailyRightsStoryIndex];

  const [dailyRightsReadModalVisible, setDailyRightsReadModalVisible] =
    useState(false);
  const [dailyRightsStoryReadToday, setDailyRightsStoryReadToday] =
    useState(false);
  const [
    dailyRightsAttentionDismissedToday,
    setDailyRightsAttentionDismissedToday,
  ] = useState(false);
  const [dailyRightsLoaded, setDailyRightsLoaded] = useState(false);
  const [dailyRightsCountdownSeconds, setDailyRightsCountdownSeconds] =
    useState(SECONDS_24H);
  const dailyRightsPrevStoryReadToday = useRef(false);

  useEffect(() => {
    if (dailyRightsStoryReadToday && !dailyRightsPrevStoryReadToday.current) {
      setDailyRightsCountdownSeconds(SECONDS_24H);
    }
    dailyRightsPrevStoryReadToday.current = dailyRightsStoryReadToday;
  }, [dailyRightsStoryReadToday]);

  useEffect(() => {
    if (!dailyRightsStoryReadToday) return;
    const dailyRightsIntervalId = setInterval(() => {
      setDailyRightsCountdownSeconds(s => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(dailyRightsIntervalId);
  }, [dailyRightsStoryReadToday]);

  const dailyRightsNextStoryTimer = formatCountdown(
    dailyRightsCountdownSeconds,
  );

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android' && dailyRightsReadModalVisible) {
        Orientation.lockToPortrait();
      }

      return () => Orientation.unlockAllOrientations();
    }, [dailyRightsReadModalVisible]),
  );

  const dismissDailyRightsAttention = async () => {
    setDailyRightsAttentionDismissedToday(true);
    try {
      await AsyncStorage.setItem(
        `${STORAGE_KEY_PREFIX}storyAttention_${dailyRightsTodayKey}`,
        '1',
      );
    } catch (_) {}
  };

  useEffect(() => {
    const fn = async () => {
      try {
        const [
          dailyRightsRead,
          dailyRightsAttentionDismissed,
          dailyRightsLevelRaw,
        ] = await Promise.all([
          AsyncStorage.getItem(
            `${STORAGE_KEY_PREFIX}storyRead_${dailyRightsTodayKey}`,
          ),
          AsyncStorage.getItem(
            `${STORAGE_KEY_PREFIX}storyAttention_${dailyRightsTodayKey}`,
          ),
          AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}currentLevel`),
        ]);
        setDailyRightsStoryReadToday(dailyRightsRead === '1');
        setDailyRightsAttentionDismissedToday(
          dailyRightsAttentionDismissed === '1',
        );
        const dailyRightsParsedLevel = Number(dailyRightsLevelRaw ?? '1');
        if (
          Number.isFinite(dailyRightsParsedLevel) &&
          dailyRightsParsedLevel >= 1 &&
          dailyRightsParsedLevel <= 10
        ) {
          setDailyRightsCurrentLevel(dailyRightsParsedLevel);
        } else {
          setDailyRightsCurrentLevel(1);
        }
      } finally {
        setDailyRightsLoaded(true);
      }
    };
    fn();
    // AsyncStorage.clear();
  }, [dailyRightsTodayKey]);

  const openDailyRightsReadModal = () => {
    setDailyRightsReadModalVisible(true);
  };

  const closeDailyRightsReadModal = async () => {
    setDailyRightsReadModalVisible(false);
    setDailyRightsStoryReadToday(true);
    try {
      await AsyncStorage.setItem(
        `${STORAGE_KEY_PREFIX}storyRead_${dailyRightsTodayKey}`,
        '1',
      );
    } catch (_) {}
  };

  const handleDailyRightsShare = async () => {
    try {
      await Share.share({
        title: dailyRightsStory.title,
        message: `${dailyRightsStory.title}\n\n${dailyRightsStory.fullText}`,
      });
    } catch (_) {}
  };

  const dailyRightsGoBack = () => {
    if (dailyRightsNavigation.canGoBack()) {
      dailyRightsNavigation.goBack();
    }
  };

  if (!dailyRightsLoaded) {
    return (
      <View style={rainWayStyles.rainWayCentered}>
        <Text style={rainWayStyles.rainWayLoadingText}>...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../RainBornAssets/images/bgs/main.png')}
      style={rainWayStyles.rainWayBackground}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Header */}
        <View style={rainWayStyles.rainWayHeader}>
          <TouchableOpacity
            onPress={dailyRightsGoBack}
            activeOpacity={0.8}
            style={{ position: 'absolute', left: 20 }}
          >
            <Image source={require('../RainBornAssets/images/back.png')} />
          </TouchableOpacity>
          <Image
            source={require('../RainBornAssets/images/calmstoryttl.png')}
          />
        </View>

        {!dailyRightsAttentionDismissedToday ? (
          <View style={rainWayStyles.rainWayAttentionScreen}>
            <Image
              source={require('../RainBornAssets/images/storyimg.png')}
              style={{
                alignSelf: 'center',
                bottom: 20,
              }}
            />
            <View style={rainWayStyles.rainWayIntroBlock}>
              <View style={rainWayStyles.rainWayAttentionIconCircle}>
                <Text style={rainWayStyles.rainWayAttentionExclamation}>!</Text>
              </View>
              <Text style={rainWayStyles.rainWayAttentionTitle}>
                ATTENTION!
              </Text>
              <Text style={rainWayStyles.rainWayAttentionMessage}>
                Only one story is available for reading per day.
              </Text>
              <TouchableOpacity
                onPress={dismissDailyRightsAttention}
                activeOpacity={0.8}
                style={rainWayStyles.rainWayAttentionOkayButton}
              >
                <ImageBackground
                  source={require('../RainBornAssets/images/onboard/button.png')}
                  style={rainWayStyles.rainWayOnboardStyleButton}
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
          <View style={rainWayStyles.rainWayCardWrapper}>
            {dailyRightsStoryReadToday && (
              <View style={rainWayStyles.rainWayNextStoryRow}>
                <Image
                  source={require('../RainBornAssets/images/attent.png')}
                />
                <Text style={rainWayStyles.rainWayNextStoryLabel}>
                  NEXT STORY: {dailyRightsNextStoryTimer}
                </Text>
              </View>
            )}

            <ImageBackground
              source={require('../RainBornAssets/images/onboard/textboard.png')}
              style={rainWayStyles.rainWayStoryBg}
              resizeMode="contain"
            >
              <View style={rainWayStyles.rainWayStoryCard}>
                <View>
                  <Text style={rainWayStyles.rainWayStoryCardTitle}>
                    {dailyRightsStory.title}
                  </Text>
                  <Text style={rainWayStyles.rainWayStoryCardExcerpt}>
                    {dailyRightsStory.excerpt}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={openDailyRightsReadModal}
                  activeOpacity={0.8}
                  style={rainWayStyles.rainWayReadButtonWrap}
                >
                  <ImageBackground
                    source={require('../RainBornAssets/images/onboard/button.png')}
                    style={rainWayStyles.rainWayOnboardStyleButton}
                  >
                    {dailyRightsStoryReadToday ? (
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
          visible={dailyRightsReadModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeDailyRightsReadModal}
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
          <View style={rainWayStyles.rainWayReadModalOverlay}>
            <View style={rainWayStyles.rainWayReadModalContent}>
              <View style={rainWayStyles.rainWayReadModalHeader}>
                <Image
                  source={require('../RainBornAssets/images/readSt.png')}
                />
                <TouchableOpacity
                  onPress={closeDailyRightsReadModal}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={rainWayStyles.rainWayReadModalClose}
                >
                  <Image
                    source={require('../RainBornAssets/images/cls.png')}
                    style={rainWayStyles.rainWayCloseIcon}
                  />
                </TouchableOpacity>
              </View>
              <ScrollView
                style={rainWayStyles.rainWayReadModalScroll}
                contentContainerStyle={
                  rainWayStyles.rainWayReadModalScrollContent
                }
                showsVerticalScrollIndicator={false}
              >
                <Image
                  source={require('../RainBornAssets/images/bgs/main.png')}
                  style={rainWayStyles.rainWayStoryImage}
                  resizeMode="cover"
                />
                <Text style={rainWayStyles.rainWayReadModalStoryTitle}>
                  {dailyRightsStory.title}
                </Text>
                {dailyRightsReadModalVisible && (
                  <TypingText
                    key={`typing-${dailyRightsStory.title}-${dailyRightsTodayKey}`}
                    text={dailyRightsStory.fullText}
                    typingSpeed={12}
                    showCursor={true}
                    cursorChar="|"
                    style={rainWayStyles.rainWayReadModalStoryText}
                    isActive={dailyRightsReadModalVisible}
                  />
                )}
              </ScrollView>
              <TouchableOpacity
                onPress={handleDailyRightsShare}
                activeOpacity={0.8}
                style={rainWayStyles.rainWayShareButtonWrap}
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
          </View>
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
  rainWayStoryBg: {
    width: 386,
    height: 386,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  rainWayAttentionScreen: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  rainWayIntroBlock: {
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
  rainWayCardWrapper: {
    flex: 1,
    paddingTop: 34,
    alignItems: 'center',
  },
  rainWayStoryCard: {
    width: '100%',
    maxWidth: 280,
    padding: 30,
  },
  rainWayStoryCardTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: '#D9D9D9',
    marginBottom: 10,
  },
  rainWayStoryCardExcerpt: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: '#D9D9D9',
    marginBottom: 10,
  },
  rainWayReadButtonWrap: {
    alignSelf: 'center',
    marginTop: 10,
  },
  rainWayOnboardStyleButton: {
    width: 236,
    height: 74,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  rainWayNextStoryRow: {
    marginTop: 16,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  rainWayNextStoryLabel: {
    fontFamily: 'Nunito-Black',
    fontSize: 15,
    color: '#000',
  },
  rainWayUnlockedStoriesText: {
    fontFamily: 'Nunito-Black',
    fontSize: 13,
    color: '#fff',
    marginBottom: 10,
  },
  rainWayAttentionIconCircle: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  rainWayAttentionExclamation: {
    fontFamily: 'Nunito-Black',
    fontSize: 42,
    color: '#000',
  },
  rainWayAttentionTitle: {
    fontFamily: 'Nunito-Black',
    fontSize: 24,
    color: '#fff',
    marginBottom: 8,
  },
  rainWayAttentionMessage: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: '#D9D9D9',
    textAlign: 'center',
    width: '50%',
  },
  rainWayAttentionOkayButton: {
    marginTop: 28,
  },
  rainWayReadModalOverlay: {
    flex: 1,
    backgroundColor: '#000000D1',
    justifyContent: 'center',
    padding: 15,
  },
  rainWayReadModalContent: {
    flex: 1,
    maxHeight: '90%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  rainWayReadModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rainWayReadModalClose: {
    padding: 4,
  },
  rainWayCloseIcon: {
    width: 24,
    height: 24,
  },
  rainWayReadModalScroll: {
    flex: 1,
  },
  rainWayReadModalScrollContent: {
    paddingBottom: 14,
  },
  rainWayStoryImage: {
    marginTop: 24,
    width: '100%',
    height: 224,
    borderRadius: 10,
    marginBottom: 16,
  },
  rainWayReadModalStoryTitle: {
    fontFamily: 'Nunito-Black',
    fontSize: 20,
    color: '#D9D9D9',
    marginBottom: 12,
  },
  rainWayReadModalStoryText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: '#D9D9D9',
  },
  rainWayTypingCursorVisible: {
    opacity: 1,
  },
  rainWayTypingCursorHidden: {
    opacity: 0,
  },
  rainWayShareButtonWrap: {
    marginVertical: 16,
  },
});

export default RainBornStories;
