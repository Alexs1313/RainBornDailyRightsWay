// quiz

import type { RainBornRoutesList } from '../../RainWaystckrotes';
import TouchableOpacity from '../[RainBorncmpnts]/RainBornAnimatedTouchable';
import { QUIZ_LEVELS } from '../../dailyqulevels';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';

type NavigationProp = StackNavigationProp<RainBornRoutesList, 'RainBornQuiz'>;
type QuizRouteProp = RouteProp<RainBornRoutesList, 'RainBornQuiz'>;

const LEVEL_STORAGE_KEY = '@RainBornDaily_currentLevel';
const TOTAL_LEVELS = 10;

const RainBornQuiz: React.FC = () => {
  const dailyRightsNavigation = useNavigation<NavigationProp>();
  const dailyRightsRoute = useRoute<QuizRouteProp>();
  const dailyRightsLevel = dailyRightsRoute.params?.level ?? 1;
  const dailyRightsMappedLevel =
    dailyRightsLevel === 1 ? 3 : dailyRightsLevel === 3 ? 1 : dailyRightsLevel;
  const dailyRightsQuiz = QUIZ_LEVELS[dailyRightsMappedLevel];
  const [dailyRightsAnswers, setDailyRightsAnswers] = useState<
    Record<number, number>
  >({});
  const [dailyRightsCurrentQuestionIdx, setDailyRightsCurrentQuestionIdx] =
    useState(0);
  const [dailyRightsResult, setDailyRightsResult] = useState<{
    score: number;
    percent: number;
    passed: boolean;
  } | null>(null);

  const dailyRightsGoBack = () => {
    if (dailyRightsNavigation.canGoBack()) dailyRightsNavigation.goBack();
  };

  const onDailyRightsSelectAnswer = (
    dailyRightsQuestionIdx: number,
    dailyRightsOptionIdx: number,
  ) => {
    if (!dailyRightsQuiz) return;
    setDailyRightsAnswers(prev => ({
      ...prev,
      [dailyRightsQuestionIdx]: dailyRightsOptionIdx,
    }));
  };

  const onDailyRightsNextQuestion = () => {
    if (!dailyRightsQuiz) return;
    if (dailyRightsAnswers[dailyRightsCurrentQuestionIdx] === undefined) return;
    if (dailyRightsCurrentQuestionIdx < dailyRightsQuiz.questions.length - 1) {
      setDailyRightsCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const dailyRightsAnsweredCount = useMemo(
    () => Object.keys(dailyRightsAnswers).length,
    [dailyRightsAnswers],
  );
  const dailyRightsCurrentQuestion =
    dailyRightsQuiz?.questions[dailyRightsCurrentQuestionIdx];
  const dailyRightsIsLastQuestion = dailyRightsQuiz
    ? dailyRightsCurrentQuestionIdx === dailyRightsQuiz.questions.length - 1
    : false;

  const onDailyRightsSubmitQuiz = async () => {
    if (!dailyRightsQuiz) return;
    if (dailyRightsAnsweredCount < dailyRightsQuiz.questions.length) {
      Alert.alert(
        'Incomplete quiz',
        `Answer all questions (${dailyRightsAnsweredCount}/${dailyRightsQuiz.questions.length})`,
      );
      return;
    }

    let dailyRightsScore = 0;
    dailyRightsQuiz.questions.forEach(
      (dailyRightsQuestion, dailyRightsIndex) => {
        if (
          dailyRightsAnswers[dailyRightsIndex] ===
          dailyRightsQuestion.correctIndex
        ) {
          dailyRightsScore += 1;
        }
      },
    );

    const dailyRightsPercent = Math.round(
      (dailyRightsScore / dailyRightsQuiz.questions.length) * 100,
    );
    const dailyRightsPassed = dailyRightsPercent >= 70;

    if (dailyRightsPassed) {
      try {
        const dailyRightsRaw = await AsyncStorage.getItem(LEVEL_STORAGE_KEY);
        const dailyRightsCurrentLevel = Number(dailyRightsRaw ?? '1');
        if (
          dailyRightsLevel === dailyRightsCurrentLevel &&
          dailyRightsCurrentLevel < TOTAL_LEVELS
        ) {
          await AsyncStorage.setItem(
            LEVEL_STORAGE_KEY,
            String(dailyRightsCurrentLevel + 1),
          );
        }
      } catch (_) {}
    }
    setDailyRightsResult({
      score: dailyRightsScore,
      percent: dailyRightsPercent,
      passed: dailyRightsPassed,
    });
  };

  const onDailyRightsShareResult = async () => {
    if (!dailyRightsQuiz || !dailyRightsResult) return;
    try {
      const dailyRightsText = dailyRightsResult.passed
        ? `I passed ${dailyRightsQuiz.title} with ${dailyRightsResult.score}/${dailyRightsQuiz.questions.length} (${dailyRightsResult.percent}%)!`
        : `I got ${dailyRightsResult.score}/${dailyRightsQuiz.questions.length} (${dailyRightsResult.percent}%)`;
      await Share.share({
        title: 'Quiz Result',
        message: dailyRightsText,
      });
    } catch (_) {}
  };

  const onDailyRightsTryAgain = () => {
    setDailyRightsAnswers({});
    setDailyRightsCurrentQuestionIdx(0);
    setDailyRightsResult(null);
  };

  const onDailyRightsNextLevel = () => {
    const dailyRightsNextLevel = dailyRightsLevel + 1;
    if (dailyRightsNextLevel > TOTAL_LEVELS) {
      dailyRightsGoBack();
      return;
    }
    if (dailyRightsQuiz && !QUIZ_LEVELS[dailyRightsNextLevel]) {
      Alert.alert(
        'Coming soon',
        `Quiz for level ${dailyRightsNextLevel} is not ready yet.`,
      );
      dailyRightsGoBack();
      return;
    }
    dailyRightsNavigation.replace('RainBornQuiz', {
      level: dailyRightsNextLevel,
    });
  };

  if (!dailyRightsQuiz) {
    return (
      <ImageBackground
        source={require('../RainBornAssets/images/bgs/main.png')}
        style={rainWayStyles.rainWayBackground}
      >
        <View style={rainWayStyles.rainWayCentered}>
          <Text style={rainWayStyles.rainWayEmptyTitle}>
            Quiz is not available yet
          </Text>
          <TouchableOpacity onPress={dailyRightsGoBack} activeOpacity={0.8}>
            <Text style={rainWayStyles.rainWayBackText}>Back</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../RainBornAssets/images/bgs/main.png')}
      style={rainWayStyles.rainWayBackground}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={rainWayStyles.rainWayHeader}>
          <TouchableOpacity
            onPress={dailyRightsGoBack}
            activeOpacity={0.8}
            style={rainWayStyles.rainWayHeaderBack}
          >
            <Image source={require('../RainBornAssets/images/back.png')} />
          </TouchableOpacity>
          <Image source={require('../RainBornAssets/images/quiz.png')} />
        </View>

        <View style={rainWayStyles.rainWayBody}>
          {!dailyRightsResult ? (
            <>
              {!!dailyRightsCurrentQuestion && (
                <ImageBackground
                  source={require('../RainBornAssets/images/textboard.png')}
                  style={rainWayStyles.rainWayQuestionCard}
                  resizeMode="contain"
                >
                  <View
                    style={{
                      padding: 20,
                      paddingHorizontal: 40,
                      width: '100%',
                    }}
                  >
                    <Text style={rainWayStyles.rainWayQuestionCounter}>
                      Question {dailyRightsCurrentQuestionIdx + 1}/
                      {dailyRightsQuiz.questions.length}
                    </Text>
                    <Text style={rainWayStyles.rainWayQuestionText}>
                      {dailyRightsCurrentQuestion.question}
                    </Text>
                    {dailyRightsCurrentQuestion.options.map(
                      (dailyRightsOpt, dailyRightsOptIdx) => {
                        const dailyRightsSelected =
                          dailyRightsAnswers[dailyRightsCurrentQuestionIdx] ===
                          dailyRightsOptIdx;
                        return (
                          <TouchableOpacity
                            key={`q-${dailyRightsCurrentQuestionIdx}-opt-${dailyRightsOptIdx}`}
                            activeOpacity={0.8}
                            onPress={() =>
                              onDailyRightsSelectAnswer(
                                dailyRightsCurrentQuestionIdx,
                                dailyRightsOptIdx,
                              )
                            }
                            style={[
                              rainWayStyles.rainWayOptionBtn,
                              dailyRightsSelected &&
                                rainWayStyles.rainWayOptionBtnSelected,
                            ]}
                          >
                            <Text
                              style={[
                                rainWayStyles.rainWayOptionText,
                                dailyRightsSelected &&
                                  rainWayStyles.rainWayOptionTextSelected,
                              ]}
                            >
                              {String.fromCharCode(65 + dailyRightsOptIdx)}.{' '}
                              {dailyRightsOpt}
                            </Text>
                          </TouchableOpacity>
                        );
                      },
                    )}
                  </View>
                </ImageBackground>
              )}

              {!dailyRightsIsLastQuestion &&
                dailyRightsAnswers[dailyRightsCurrentQuestionIdx] !==
                  undefined && (
                  <TouchableOpacity
                    onPress={onDailyRightsNextQuestion}
                    activeOpacity={0.8}
                    style={rainWayStyles.rainWaySubmitWrap}
                  >
                    <ImageBackground
                      source={require('../RainBornAssets/images/onboard/button.png')}
                      style={rainWayStyles.rainWayOnboardStyleButton}
                    >
                      <Image
                        source={require('../RainBornAssets/images/nextq.png')}
                      />
                    </ImageBackground>
                  </TouchableOpacity>
                )}

              {dailyRightsIsLastQuestion &&
                dailyRightsAnswers[dailyRightsCurrentQuestionIdx] !==
                  undefined && (
                  <TouchableOpacity
                    onPress={onDailyRightsSubmitQuiz}
                    activeOpacity={0.8}
                    style={rainWayStyles.rainWaySubmitWrap}
                  >
                    <ImageBackground
                      source={require('../RainBornAssets/images/onboard/button.png')}
                      style={rainWayStyles.rainWayOnboardStyleButton}
                    >
                      <Image
                        source={require('../RainBornAssets/images/Done.png')}
                      />
                    </ImageBackground>
                  </TouchableOpacity>
                )}
            </>
          ) : (
            <View style={rainWayStyles.rainWayResultScreen}>
              <Image
                source={require('../RainBornAssets/images/lepricon.png')}
                style={rainWayStyles.rainWayResultLeprechaun}
              />
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/textboard.png')}
                style={rainWayStyles.rainWayResultBoard}
                resizeMode="contain"
              >
                <View style={rainWayStyles.rainWayResultBoardContent}>
                  {dailyRightsResult.passed ? (
                    <Image
                      source={require('../RainBornAssets/images/compl.png')}
                      style={{ marginBottom: 20 }}
                    />
                  ) : (
                    <Image
                      source={require('../RainBornAssets/images/nothis.png')}
                      style={{ marginBottom: 20 }}
                    />
                  )}

                  <Text style={rainWayStyles.rainWayResultScore}>
                    {dailyRightsResult.score}/{dailyRightsQuiz.questions.length}
                  </Text>
                  <Text style={rainWayStyles.rainWayResultScore}>
                    {dailyRightsResult.passed
                      ? 'You passed the quiz!'
                      : "You didn't pass the quiz. Try again!"}
                  </Text>
                  {dailyRightsResult.passed && (
                    <Text style={rainWayStyles.rainWayResultScore}>
                      New story unlocked!
                    </Text>
                  )}

                  <TouchableOpacity
                    onPress={onDailyRightsShareResult}
                    activeOpacity={0.8}
                    style={rainWayStyles.rainWaySubmitWrap}
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
              {dailyRightsResult.passed ? (
                <TouchableOpacity
                  onPress={onDailyRightsNextLevel}
                  activeOpacity={0.8}
                  style={rainWayStyles.rainWayResultBottomButton}
                >
                  <ImageBackground
                    source={require('../RainBornAssets/images/onboard/button.png')}
                    style={rainWayStyles.rainWayOnboardStyleButton}
                  >
                    <Image
                      source={require('../RainBornAssets/images/next.png')}
                    />
                  </ImageBackground>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={onDailyRightsTryAgain}
                  activeOpacity={0.8}
                  style={rainWayStyles.rainWayResultBottomButton}
                >
                  <ImageBackground
                    source={require('../RainBornAssets/images/onboard/button.png')}
                    style={rainWayStyles.rainWayOnboardStyleButton}
                  >
                    <Image
                      source={require('../RainBornAssets/images/tryag.png')}
                    />
                  </ImageBackground>
                </TouchableOpacity>
              )}
            </View>
          )}
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
  rainWayBody: {
    paddingHorizontal: 16,
    paddingTop: 20,
    marginTop: 20,
  },
  rainWayQuizTitle: {
    color: '#fff',
    fontFamily: 'Nunito-Black',
    fontSize: 16,
    marginBottom: 8,
  },
  rainWayProgressText: {
    color: '#D9D9D9',
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    marginBottom: 12,
  },
  rainWayQuestionCard: {
    marginBottom: 12,
    width: 386,
    height: 386,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
    paddingHorizontal: 40,
  },
  rainWayQuestionText: {
    color: '#fff',
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    marginBottom: 10,
  },
  rainWayQuestionCounter: {
    color: '#E87850',
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    marginBottom: 8,
  },
  rainWayOptionBtn: {
    backgroundColor: '#0D2807',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF33',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
  },
  rainWayOptionBtnSelected: {
    backgroundColor: '#1E4B12',
  },
  rainWayOptionText: {
    color: '#D9D9D9',
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
  },
  rainWayOptionTextSelected: {
    color: '#fff',
    fontFamily: 'Nunito-Bold',
  },
  rainWaySubmitWrap: {
    alignItems: 'center',
    marginTop: 8,
  },
  rainWayOnboardStyleButton: {
    width: 236,
    height: 74,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  rainWaySubmitText: {
    fontSize: 24,
    color: 'rgba(169, 22, 0, 1)',
    fontFamily: 'Nunito-Black',
  },
  rainWayResultScreen: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rainWayResultLeprechaun: {
    alignSelf: 'center',
    top: 20,
    width: 180,
    height: 280,
  },
  rainWayResultBoard: {
    width: 386,
    height: 386,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
    top: -60,
  },
  rainWayResultBoardContent: {
    paddingVertical: 24,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  rainWayResultTitle: {
    color: '#fff',
    fontFamily: 'Nunito-Black',
    fontSize: 22,
    marginBottom: 8,
  },
  rainWayResultScore: {
    color: '#D9D9D9',
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    marginBottom: 12,
  },
  rainWayResultBottomButton: {
    top: -60,
    alignSelf: 'center',
  },
  rainWayCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  rainWayEmptyTitle: {
    color: '#fff',
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
  },
  rainWayBackText: {
    color: '#E87850',
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
  },
});

export default RainBornQuiz;
