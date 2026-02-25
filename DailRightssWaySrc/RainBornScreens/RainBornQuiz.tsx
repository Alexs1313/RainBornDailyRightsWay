import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
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
import type { RainBornRoutesList } from '../../Roter';
import TouchableOpacity from '../RainBornComponents/RainBornAnimatedTouchable';
import { QUIZ_LEVELS } from '../../dailyqulevels';

type NavigationProp = StackNavigationProp<RainBornRoutesList, 'RainBornQuiz'>;
type QuizRouteProp = RouteProp<RainBornRoutesList, 'RainBornQuiz'>;

const LEVEL_STORAGE_KEY = '@RainBornDaily_currentLevel';
const TOTAL_LEVELS = 10;

const RainBornQuiz: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<QuizRouteProp>();
  const level = route.params?.level ?? 1;
  const mappedLevel = level === 1 ? 3 : level === 3 ? 1 : level;
  const quiz = QUIZ_LEVELS[mappedLevel];
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [result, setResult] = useState<{
    score: number;
    percent: number;
    passed: boolean;
  } | null>(null);

  const goBack = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
  }, [navigation]);

  const onSelectAnswer = useCallback(
    (questionIdx: number, optionIdx: number) => {
      if (!quiz) return;
      setAnswers(prev => ({ ...prev, [questionIdx]: optionIdx }));
    },
    [quiz],
  );

  const onNextQuestion = useCallback(() => {
    if (!quiz) return;
    if (answers[currentQuestionIdx] === undefined) return;
    if (currentQuestionIdx < quiz.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  }, [answers, currentQuestionIdx, quiz]);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const currentQuestion = quiz?.questions[currentQuestionIdx];
  const isLastQuestion = quiz
    ? currentQuestionIdx === quiz.questions.length - 1
    : false;

  const onSubmitQuiz = useCallback(async () => {
    if (!quiz) return;
    if (answeredCount < quiz.questions.length) {
      Alert.alert(
        'Incomplete quiz',
        `Answer all questions (${answeredCount}/${quiz.questions.length})`,
      );
      return;
    }

    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) score += 1;
    });

    const percent = Math.round((score / quiz.questions.length) * 100);
    const passed = percent >= 70;

    let unlockedToLevel = level;
    if (passed) {
      try {
        const raw = await AsyncStorage.getItem(LEVEL_STORAGE_KEY);
        const currentLevel = Number(raw ?? '1');
        if (level === currentLevel && currentLevel < TOTAL_LEVELS) {
          await AsyncStorage.setItem(
            LEVEL_STORAGE_KEY,
            String(currentLevel + 1),
          );
          unlockedToLevel = currentLevel + 1;
        }
      } catch (_) {}
    }
    setResult({ score, percent, passed });
  }, [quiz, answeredCount, answers, level]);

  const onShareResult = useCallback(async () => {
    if (!quiz || !result) return;
    try {
      const text = result.passed
        ? `I passed ${quiz.title} with ${result.score}/${quiz.questions.length} (${result.percent}%)!`
        : `I got ${result.score}/${quiz.questions.length} (${result.percent}%)`;
      await Share.share({
        title: 'Quiz Result',
        message: text,
      });
    } catch (_) {}
  }, [quiz, result]);

  const onTryAgain = useCallback(() => {
    setAnswers({});
    setCurrentQuestionIdx(0);
    setResult(null);
  }, []);

  const onNextLevel = useCallback(() => {
    const nextLevel = level + 1;
    if (nextLevel > TOTAL_LEVELS) {
      goBack();
      return;
    }
    if (quiz && !QUIZ_LEVELS[nextLevel]) {
      Alert.alert(
        'Coming soon',
        `Quiz for level ${nextLevel} is not ready yet.`,
      );
      goBack();
      return;
    }
    navigation.replace('RainBornQuiz', { level: nextLevel });
  }, [level, goBack, navigation, quiz]);

  if (!quiz) {
    return (
      <ImageBackground
        source={require('../RainBornAssets/images/bgs/main.png')}
        style={styles.background}
      >
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Quiz is not available yet</Text>
          <TouchableOpacity onPress={goBack} activeOpacity={0.8}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../RainBornAssets/images/bgs/main.png')}
      style={styles.background}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={goBack}
            activeOpacity={0.8}
            style={styles.headerBack}
          >
            <Image source={require('../RainBornAssets/images/back.png')} />
          </TouchableOpacity>
          <Image source={require('../RainBornAssets/images/quiz.png')} />
        </View>

        <View style={styles.body}>
          {!result ? (
            <>
              {!!currentQuestion && (
                <ImageBackground
                  source={require('../RainBornAssets/images/textboard.png')}
                  style={styles.questionCard}
                  resizeMode="contain"
                >
                  <View
                    style={{
                      padding: 20,
                      paddingHorizontal: 40,
                      width: '100%',
                    }}
                  >
                    <Text style={styles.questionCounter}>
                      Question {currentQuestionIdx + 1}/{quiz.questions.length}
                    </Text>
                    <Text style={styles.questionText}>
                      {currentQuestion.question}
                    </Text>
                    {currentQuestion.options.map((opt, optIdx) => {
                      const selected = answers[currentQuestionIdx] === optIdx;
                      return (
                        <TouchableOpacity
                          key={`q-${currentQuestionIdx}-opt-${optIdx}`}
                          activeOpacity={0.8}
                          onPress={() =>
                            onSelectAnswer(currentQuestionIdx, optIdx)
                          }
                          style={[
                            styles.optionBtn,
                            selected && styles.optionBtnSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              selected && styles.optionTextSelected,
                            ]}
                          >
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ImageBackground>
              )}

              {!isLastQuestion && answers[currentQuestionIdx] !== undefined && (
                <TouchableOpacity
                  onPress={onNextQuestion}
                  activeOpacity={0.8}
                  style={styles.submitWrap}
                >
                  <ImageBackground
                    source={require('../RainBornAssets/images/onboard/button.png')}
                    style={styles.onboardStyleButton}
                  >
                    <Image
                      source={require('../RainBornAssets/images/nextq.png')}
                    />
                  </ImageBackground>
                </TouchableOpacity>
              )}

              {isLastQuestion && answers[currentQuestionIdx] !== undefined && (
                <TouchableOpacity
                  onPress={onSubmitQuiz}
                  activeOpacity={0.8}
                  style={styles.submitWrap}
                >
                  <ImageBackground
                    source={require('../RainBornAssets/images/onboard/button.png')}
                    style={styles.onboardStyleButton}
                  >
                    <Image
                      source={require('../RainBornAssets/images/Done.png')}
                    />
                  </ImageBackground>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.resultScreen}>
              <Image
                source={require('../RainBornAssets/images/lepricon.png')}
                style={styles.resultLeprechaun}
              />
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/textboard.png')}
                style={styles.resultBoard}
                resizeMode="contain"
              >
                <View style={styles.resultBoardContent}>
                  {result.passed ? (
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

                  <Text style={styles.resultScore}>
                    {result.score}/{quiz.questions.length}
                  </Text>
                  <Text style={styles.resultScore}>
                    {result.passed
                      ? 'You passed the quiz!'
                      : "You didn't pass the quiz. Try again!"}
                  </Text>
                  {result.passed && (
                    <Text style={styles.resultScore}>New story unlocked!</Text>
                  )}

                  <TouchableOpacity
                    onPress={onShareResult}
                    activeOpacity={0.8}
                    style={styles.submitWrap}
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
              {result.passed ? (
                <TouchableOpacity
                  onPress={onNextLevel}
                  activeOpacity={0.8}
                  style={styles.resultBottomButton}
                >
                  <ImageBackground
                    source={require('../RainBornAssets/images/onboard/button.png')}
                    style={styles.onboardStyleButton}
                  >
                    <Image
                      source={require('../RainBornAssets/images/next.png')}
                    />
                  </ImageBackground>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={onTryAgain}
                  activeOpacity={0.8}
                  style={styles.resultBottomButton}
                >
                  <ImageBackground
                    source={require('../RainBornAssets/images/onboard/button.png')}
                    style={styles.onboardStyleButton}
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
  body: {
    paddingHorizontal: 16,
    paddingTop: 20,
    marginTop: 20,
  },
  quizTitle: {
    color: '#fff',
    fontFamily: 'Nunito-Black',
    fontSize: 16,
    marginBottom: 8,
  },
  progressText: {
    color: '#D9D9D9',
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    marginBottom: 12,
  },
  questionCard: {
    marginBottom: 12,
    width: 386,
    height: 386,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
    paddingHorizontal: 40,
  },
  questionText: {
    color: '#fff',
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    marginBottom: 10,
  },
  questionCounter: {
    color: '#E87850',
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    marginBottom: 8,
  },
  optionBtn: {
    backgroundColor: '#0D2807',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF33',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
  },
  optionBtnSelected: {
    backgroundColor: '#1E4B12',
  },
  optionText: {
    color: '#D9D9D9',
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
  },
  optionTextSelected: {
    color: '#fff',
    fontFamily: 'Nunito-Bold',
  },
  submitWrap: {
    alignItems: 'center',
    marginTop: 8,
  },
  onboardStyleButton: {
    width: 236,
    height: 74,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  submitText: {
    fontSize: 24,
    color: 'rgba(169, 22, 0, 1)',
    fontFamily: 'Nunito-Black',
  },
  resultScreen: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultLeprechaun: {
    alignSelf: 'center',
    top: 20,
    width: 180,
    height: 280,
  },
  resultBoard: {
    width: 386,
    height: 386,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
    top: -60,
  },
  resultBoardContent: {
    paddingVertical: 24,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  resultTitle: {
    color: '#fff',
    fontFamily: 'Nunito-Black',
    fontSize: 22,
    marginBottom: 8,
  },
  resultScore: {
    color: '#D9D9D9',
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    marginBottom: 12,
  },
  resultBottomButton: {
    top: -60,
    alignSelf: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: '#fff',
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
  },
  backText: {
    color: '#E87850',
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
  },
});

export default RainBornQuiz;
