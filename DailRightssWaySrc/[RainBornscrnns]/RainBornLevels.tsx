// levels

import type { StackNavigationProp } from '@react-navigation/stack';
import type { RainBornRoutesList } from '../../RainWaystckrotes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
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

type NavigationProp = StackNavigationProp<RainBornRoutesList, 'RainBornLevels'>;

const LEVELS_TOTAL = 12;
const LEVEL_STORAGE_KEY = '@RainBornDaily_currentLevel';

const RainBornLevels: React.FC = () => {
  const dailyRightsNavigation = useNavigation<NavigationProp>();
  const [dailyRightsCurrentLevel, setDailyRightsCurrentLevel] = useState(1);
  const [dailyRightsShakingLevel, setDailyRightsShakingLevel] = useState<
    number | null
  >(null);
  const dailyRightsShakeAnim = useState(new Animated.Value(0))[0];

  const dailyRightsLoadLevel = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(LEVEL_STORAGE_KEY);
      const parsed = Number(raw ?? '1');
      if (Number.isFinite(parsed) && parsed >= 1 && parsed <= LEVELS_TOTAL) {
        setDailyRightsCurrentLevel(parsed);
      } else {
        setDailyRightsCurrentLevel(1);
      }
    } catch (_) {
      setDailyRightsCurrentLevel(1);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      dailyRightsLoadLevel();
    }, [dailyRightsLoadLevel]),
  );

  const dailyRightsGoBack = useCallback(() => {
    if (dailyRightsNavigation.canGoBack()) dailyRightsNavigation.goBack();
  }, [dailyRightsNavigation]);

  const onDailyRightsStart = useCallback(() => {
    dailyRightsNavigation.navigate('RainBornQuiz', {
      level: dailyRightsCurrentLevel,
    });
  }, [dailyRightsCurrentLevel, dailyRightsNavigation]);

  const onDailyRightsPressLevel = useCallback(
    (dailyRightsLevel: number, dailyRightsUnlocked: boolean) => {
      if (dailyRightsUnlocked) {
        dailyRightsNavigation.navigate('RainBornQuiz', {
          level: dailyRightsLevel,
        });
        return;
      }

      setDailyRightsShakingLevel(dailyRightsLevel);
      dailyRightsShakeAnim.setValue(0);
      Animated.sequence([
        Animated.timing(dailyRightsShakeAnim, {
          toValue: 1,
          duration: 55,
          useNativeDriver: true,
        }),
        Animated.timing(dailyRightsShakeAnim, {
          toValue: -1,
          duration: 55,
          useNativeDriver: true,
        }),
        Animated.timing(dailyRightsShakeAnim, {
          toValue: 1,
          duration: 55,
          useNativeDriver: true,
        }),
        Animated.timing(dailyRightsShakeAnim, {
          toValue: -1,
          duration: 55,
          useNativeDriver: true,
        }),
        Animated.timing(dailyRightsShakeAnim, {
          toValue: 0,
          duration: 55,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setDailyRightsShakingLevel(null);
      });
    },
    [dailyRightsNavigation, dailyRightsShakeAnim],
  );

  return (
    <ImageBackground
      source={require('../RainBornAssets/images/bg.png')}
      style={rainWayStyles.rainWayBackground}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={rainWayStyles.rainWayHeader}>
          <TouchableOpacity
            onPress={dailyRightsGoBack}
            activeOpacity={0.8}
            style={rainWayStyles.rainWayHeaderBack}
          >
            <Image source={require('../RainBornAssets/images/back.png')} />
          </TouchableOpacity>
          <Image source={require('../RainBornAssets/images/lvls.png')} />
        </View>

        <View style={rainWayStyles.rainWayContent}>
          <View style={rainWayStyles.rainWayLevelsGrid}>
            {Array.from({ length: LEVELS_TOTAL }, (_, i) => {
              const level = i + 1;
              const dailyRightsUnlocked = level <= dailyRightsCurrentLevel;
              return (
                <TouchableOpacity
                  key={`level-${level}`}
                  activeOpacity={0.9}
                  onPress={() =>
                    onDailyRightsPressLevel(level, dailyRightsUnlocked)
                  }
                >
                  <Animated.View
                    style={[
                      rainWayStyles.rainWayLevelCard,
                      !dailyRightsUnlocked &&
                        rainWayStyles.rainWayLevelCardLocked,
                      dailyRightsShakingLevel === level && {
                        transform: [
                          {
                            translateX: dailyRightsShakeAnim.interpolate({
                              inputRange: [-1, 1],
                              outputRange: [-7, 7],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    {!dailyRightsUnlocked ? (
                      <Image
                        source={require('../RainBornAssets/images/lock.png')}
                        style={{ width: 50, height: 50 }}
                      />
                    ) : (
                      <Text style={rainWayStyles.rainWayLevelNumber}>
                        {level}
                      </Text>
                    )}
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={onDailyRightsStart}
            activeOpacity={0.8}
            style={rainWayStyles.rainWayStartButtonWrap}
          >
            <ImageBackground
              source={require('../RainBornAssets/images/onboard/button.png')}
              style={rainWayStyles.rainWayOnboardStyleButton}
            >
              <Image source={require('../RainBornAssets/images/strt.png')} />
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
    minHeight: 66,
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
    flex: 1,
    paddingTop: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  rainWayLevelsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  rainWayLevelCard: {
    width: 111,
    height: 111,
    backgroundColor: '#123509',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
    minHeight: 78,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  rainWayLevelCardLocked: {
    opacity: 0.85,
    backgroundColor: 'rgba(53, 9, 9, 1)',
  },
  rainWayLevelNumber: {
    color: '#fff',
    fontFamily: 'Nunito-Bold',
    fontSize: 32,
  },
  rainWayLevelStatus: {
    marginTop: 4,
    color: '#E87850',
    fontFamily: 'Nunito-Black',
    fontSize: 12,
  },
  rainWayStartButtonWrap: {
    marginTop: 34,
    alignSelf: 'center',
    marginBottom: 20,
  },
  rainWayOnboardStyleButton: {
    width: 236,
    height: 74,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  rainWayStartText: {
    fontSize: 24,
    color: 'rgba(169, 22, 0, 1)',
    fontFamily: 'Nunito-Black',
  },
});

export default RainBornLevels;
