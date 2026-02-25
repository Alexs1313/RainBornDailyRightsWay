import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
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
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RainBornRoutesList } from '../../Roter';
import TouchableOpacity from '../RainBornComponents/RainBornAnimatedTouchable';

type NavigationProp = StackNavigationProp<RainBornRoutesList, 'RainBornLevels'>;

const LEVELS_TOTAL = 12;
const LEVEL_STORAGE_KEY = '@RainBornDaily_currentLevel';

const RainBornLevels: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [shakingLevel, setShakingLevel] = useState<number | null>(null);
  const shakeAnim = useState(new Animated.Value(0))[0];

  const loadLevel = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(LEVEL_STORAGE_KEY);
      const parsed = Number(raw ?? '1');
      if (Number.isFinite(parsed) && parsed >= 1 && parsed <= LEVELS_TOTAL) {
        setCurrentLevel(parsed);
      } else {
        setCurrentLevel(1);
      }
    } catch (_) {
      setCurrentLevel(1);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLevel();
    }, [loadLevel]),
  );

  const goBack = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
  }, [navigation]);

  const onStart = useCallback(() => {
    navigation.navigate('RainBornQuiz', { level: currentLevel });
  }, [currentLevel, navigation]);

  const onPressLevel = useCallback(
    (level: number, unlocked: boolean) => {
      if (unlocked) {
        navigation.navigate('RainBornQuiz', { level });
        return;
      }

      setShakingLevel(level);
      shakeAnim.setValue(0);
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: 55,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -1,
          duration: 55,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: 55,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -1,
          duration: 55,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 55,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShakingLevel(null);
      });
    },
    [navigation, shakeAnim],
  );

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
          <TouchableOpacity
            onPress={goBack}
            activeOpacity={0.8}
            style={styles.headerBack}
          >
            <Image source={require('../RainBornAssets/images/back.png')} />
          </TouchableOpacity>
          <Image source={require('../RainBornAssets/images/lvls.png')} />
        </View>

        <View style={styles.content}>
          <View style={styles.levelsGrid}>
            {Array.from({ length: LEVELS_TOTAL }, (_, i) => {
              const level = i + 1;
              const unlocked = level <= currentLevel;
              return (
                <TouchableOpacity
                  key={`level-${level}`}
                  activeOpacity={0.9}
                  onPress={() => onPressLevel(level, unlocked)}
                >
                  <Animated.View
                    style={[
                      styles.levelCard,
                      !unlocked && styles.levelCardLocked,
                      shakingLevel === level && {
                        transform: [
                          {
                            translateX: shakeAnim.interpolate({
                              inputRange: [-1, 1],
                              outputRange: [-7, 7],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    {!unlocked ? (
                      <Image
                        source={require('../RainBornAssets/images/lock.png')}
                        style={{ width: 50, height: 50 }}
                      />
                    ) : (
                      <Text style={styles.levelNumber}>{level}</Text>
                    )}
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={onStart}
            activeOpacity={0.8}
            style={styles.startButtonWrap}
          >
            <ImageBackground
              source={require('../RainBornAssets/images/onboard/button.png')}
              style={styles.onboardStyleButton}
            >
              <Image source={require('../RainBornAssets/images/strt.png')} />
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
    minHeight: 66,
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
    flex: 1,
    paddingTop: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  levelsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  levelCard: {
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
  levelCardLocked: {
    opacity: 0.85,
    backgroundColor: 'rgba(53, 9, 9, 1)',
  },
  levelNumber: {
    color: '#fff',
    fontFamily: 'Nunito-Bold',
    fontSize: 32,
  },
  levelStatus: {
    marginTop: 4,
    color: '#E87850',
    fontFamily: 'Nunito-Black',
    fontSize: 12,
  },
  startButtonWrap: {
    marginTop: 34,
    alignSelf: 'center',
    marginBottom: 20,
  },
  onboardStyleButton: {
    width: 236,
    height: 74,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  startText: {
    fontSize: 24,
    color: 'rgba(169, 22, 0, 1)',
    fontFamily: 'Nunito-Black',
  },
});

export default RainBornLevels;
