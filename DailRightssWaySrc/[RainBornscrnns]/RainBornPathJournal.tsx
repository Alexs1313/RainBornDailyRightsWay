// path journal

import Orientation from 'react-native-orientation-locker';
import TouchableOpacity from '../[RainBorncmpnts]/RainBornAnimatedTouchable';
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
  TextInput,
  View,
} from 'react-native';

const STORAGE_KEY = '@RainBornDaily_journal';

interface JournalNote {
  id: string;
  date: string;
  text: string;
}

function formatDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
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

const RainBornPathJournal: React.FC = () => {
  const dailyRightsNavigation = useNavigation();
  const [dailyRightsNotes, setDailyRightsNotes] = useState<JournalNote[]>([]);
  const [dailyRightsLoaded, setDailyRightsLoaded] = useState(false);
  const [dailyRightsShowAddNote, setDailyRightsShowAddNote] = useState(false);
  const [dailyRightsNewNoteText, setDailyRightsNewNoteText] = useState('');
  const [dailyRightsSelectedNote, setDailyRightsSelectedNote] =
    useState<JournalNote | null>(null);
  const [dailyRightsShowCalendar, setDailyRightsShowCalendar] = useState(false);
  const [dailyRightsCalendarMonth, setDailyRightsCalendarMonth] = useState(
    () => new Date(),
  );
  const [dailyRightsSelectedCalendarDate, setDailyRightsSelectedCalendarDate] =
    useState<Date | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android' && !!dailyRightsSelectedNote) {
        Orientation.lockToPortrait();
      }

      return () => Orientation.unlockAllOrientations();
    }, [dailyRightsSelectedNote]),
  );

  const loadDailyRightsNotes = async () => {
    try {
      const dailyRightsRaw = await AsyncStorage.getItem(STORAGE_KEY);
      if (dailyRightsRaw) {
        const dailyRightsParsed = JSON.parse(dailyRightsRaw);
        setDailyRightsNotes(
          Array.isArray(dailyRightsParsed) ? dailyRightsParsed : [],
        );
      } else {
        setDailyRightsNotes([]);
      }
    } catch (_) {
      setDailyRightsNotes([]);
    } finally {
      setDailyRightsLoaded(true);
    }
  };

  useEffect(() => {
    const fn = async () => {
      await loadDailyRightsNotes();
    };
    fn();
  }, []);

  const saveDailyRightsNotes = async (dailyRightsNextNotes: JournalNote[]) => {
    setDailyRightsNotes(dailyRightsNextNotes);
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(dailyRightsNextNotes),
      );
    } catch (_) {}
  };

  const dailyRightsGoBack = () => {
    if (dailyRightsNavigation.canGoBack()) dailyRightsNavigation.goBack();
  };

  const onDailyRightsAddNote = () => {
    setDailyRightsNewNoteText('');
    setDailyRightsShowAddNote(true);
  };

  const onDailyRightsSaveNote = () => {
    const dailyRightsText = dailyRightsNewNoteText.trim();
    if (!dailyRightsText) return;
    const dailyRightsNote: JournalNote = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date: formatDate(new Date()),
      text: dailyRightsText,
    };
    saveDailyRightsNotes([dailyRightsNote, ...dailyRightsNotes]);
    setDailyRightsNewNoteText('');
    setDailyRightsShowAddNote(false);
  };

  const onDailyRightsOpenNote = (dailyRightsNote: JournalNote) => {
    setDailyRightsSelectedNote(dailyRightsNote);
  };

  const onDailyRightsCloseNote = () => {
    setDailyRightsSelectedNote(null);
  };

  const onDailyRightsDeleteNote = () => {
    if (!dailyRightsSelectedNote) return;
    saveDailyRightsNotes(
      dailyRightsNotes.filter(note => note.id !== dailyRightsSelectedNote.id),
    );
    setDailyRightsSelectedNote(null);
  };

  const onDailyRightsShareNote = async () => {
    if (!dailyRightsSelectedNote) return;
    try {
      await Share.share({
        title: `Journal ${dailyRightsSelectedNote.date}`,
        message: dailyRightsSelectedNote.text,
      });
    } catch (_) {}
  };

  if (!dailyRightsLoaded) {
    return (
      <View style={rainWayStyles.rainWayCentered}>
        <Text style={rainWayStyles.rainWayLoadingText}>...</Text>
      </View>
    );
  }

  const dailyRightsIsEmpty = dailyRightsNotes.length === 0;

  return (
    <ImageBackground
      source={
        dailyRightsIsEmpty
          ? require('../RainBornAssets/images/empybg.png')
          : require('../RainBornAssets/images/bgs/main.png')
      }
      style={rainWayStyles.rainWayBackground}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={rainWayStyles.rainWayHeader}>
          <TouchableOpacity
            onPress={
              dailyRightsShowCalendar
                ? () => {
                    setDailyRightsShowCalendar(false);
                    setDailyRightsSelectedCalendarDate(null);
                  }
                : dailyRightsGoBack
            }
            activeOpacity={0.8}
            style={rainWayStyles.rainWayHeaderBack}
          >
            <Image source={require('../RainBornAssets/images/back.png')} />
          </TouchableOpacity>
          {dailyRightsShowCalendar ? (
            <Image
              source={require('../RainBornAssets/images/calendarttl.png')}
            />
          ) : (
            <Text style={rainWayStyles.rainWayHeaderTitle}>
              {dailyRightsShowAddNote ? (
                <Image
                  source={require('../RainBornAssets/images/addNotr.png')}
                />
              ) : (
                <Image
                  source={require('../RainBornAssets/images/pathjrnl.png')}
                />
              )}
            </Text>
          )}
        </View>

        {dailyRightsShowCalendar ? (
          <View style={rainWayStyles.rainWayCalendarScreen}>
            <Text style={rainWayStyles.rainWayChooseDayText}>
              CHOOSE A DAY:
            </Text>
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
                    <Text style={rainWayStyles.rainWayCalendarNavArrow}>‹</Text>
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
                    <Text style={rainWayStyles.rainWayCalendarNavArrow}>›</Text>
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
                    dailyRightsSelectedCalendarDate &&
                    dailyRightsSelectedCalendarDate.getDate() === d &&
                    dailyRightsSelectedCalendarDate.getMonth() ===
                      dailyRightsCalendarMonth.getMonth() &&
                    dailyRightsSelectedCalendarDate.getFullYear() ===
                      dailyRightsCalendarMonth.getFullYear();
                  if (d === null) {
                    return (
                      <View
                        key={`e-${i}`}
                        style={rainWayStyles.rainWayDayCell}
                      />
                    );
                  }
                  return (
                    <TouchableOpacity
                      key={`d-${d}`}
                      style={rainWayStyles.rainWayDayCell}
                      onPress={() =>
                        setDailyRightsSelectedCalendarDate(
                          new Date(
                            dailyRightsCalendarMonth.getFullYear(),
                            dailyRightsCalendarMonth.getMonth(),
                            d,
                          ),
                        )
                      }
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          rainWayStyles.rainWayDayCellCircle,
                          dailyRightsIsSelected &&
                            rainWayStyles.rainWayDayCellSelected,
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
            {dailyRightsSelectedCalendarDate &&
              (() => {
                const dailyRightsDateStr = formatDate(
                  dailyRightsSelectedCalendarDate,
                );
                const dailyRightsNotesForDay = dailyRightsNotes.filter(
                  note => note.date === dailyRightsDateStr,
                );
                if (dailyRightsNotesForDay.length === 0) {
                  return (
                    <Text style={rainWayStyles.rainWayNoEntriesText}>
                      No entries for this day
                    </Text>
                  );
                }
                return (
                  <View style={rainWayStyles.rainWayCalendarCardsWrap}>
                    {dailyRightsNotesForDay.map(note => (
                      <ImageBackground
                        source={require('../RainBornAssets/images/onboard/textboard.png')}
                        style={rainWayStyles.rainWayEntryCardBg}
                        resizeMode="contain"
                        key={note.id}
                      >
                        <View style={rainWayStyles.rainWayEntryCard}>
                          <Text style={rainWayStyles.rainWayEntryDate}>
                            {note.date}
                          </Text>
                          <Text
                            style={rainWayStyles.rainWayEntrySnippet}
                            numberOfLines={3}
                          >
                            {note.text}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            setDailyRightsShowCalendar(false);
                            onDailyRightsOpenNote(note);
                          }}
                          activeOpacity={0.8}
                          style={rainWayStyles.rainWayOpenButtonWrap}
                        >
                          <ImageBackground
                            source={require('../RainBornAssets/images/onboard/button.png')}
                            style={[
                              rainWayStyles.rainWayOnboardStyleButton,
                              rainWayStyles.rainWayOpenButton,
                            ]}
                          >
                            <Image
                              source={require('../RainBornAssets/images/opn.png')}
                            />
                          </ImageBackground>
                        </TouchableOpacity>
                      </ImageBackground>
                    ))}
                  </View>
                );
              })()}
          </View>
        ) : dailyRightsShowAddNote ? (
          <View style={rainWayStyles.rainWayAddNoteScreen}>
            <View style={rainWayStyles.rainWayNotePanel}>
              <Text style={rainWayStyles.rainWayNoteDate}>
                {formatDate(new Date())}
              </Text>
              <TextInput
                style={rainWayStyles.rainWayNoteInput}
                placeholder="HOW ARE YOU NOW?"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={dailyRightsNewNoteText}
                onChangeText={setDailyRightsNewNoteText}
                multiline
                textAlignVertical="top"
              />
            </View>
            {dailyRightsNewNoteText && (
              <TouchableOpacity
                onPress={onDailyRightsSaveNote}
                activeOpacity={0.8}
                style={rainWayStyles.rainWaySaveButtonWrap}
              >
                <ImageBackground
                  source={require('../RainBornAssets/images/onboard/button.png')}
                  style={rainWayStyles.rainWayOnboardStyleButton}
                >
                  <Image
                    source={require('../RainBornAssets/images/SAVE.png')}
                  />
                </ImageBackground>
              </TouchableOpacity>
            )}
          </View>
        ) : dailyRightsIsEmpty ? (
          <View style={rainWayStyles.rainWayEmptyState}>
            <View style={rainWayStyles.rainWayAvatarWrap}>
              <Image source={require('../RainBornAssets/images/s.png')} />
            </View>
            <Image
              source={require('../RainBornAssets/images/welcometxt.png')}
            />
            <Text style={rainWayStyles.rainWayEmptyParagraph}>
              Add the first entry to the journal, and don't forget to share your
              thoughts here, I'm here and will accept any opinion you have.
            </Text>
            <TouchableOpacity
              onPress={onDailyRightsAddNote}
              activeOpacity={0.8}
              style={rainWayStyles.rainWayAddNoteButtonWrap}
            >
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={rainWayStyles.rainWayOnboardStyleButton}
              >
                <Image
                  source={require('../RainBornAssets/images/addNote.png')}
                />
              </ImageBackground>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={rainWayStyles.rainWayListScroll}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={rainWayStyles.rainWayCalendarButtonWrap}
              onPress={() => {
                const today = new Date();
                setDailyRightsCalendarMonth(today);
                setDailyRightsSelectedCalendarDate(today);
                setDailyRightsShowCalendar(true);
              }}
            >
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={rainWayStyles.rainWayOnboardStyleButton}
              >
                <Image
                  source={require('../RainBornAssets/images/CALENDAR.png')}
                />
              </ImageBackground>
            </TouchableOpacity>
            {dailyRightsNotes.map(note => (
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/textboard.png')}
                style={rainWayStyles.rainWayEntryCardBg}
                resizeMode="contain"
                key={note.id}
              >
                <View style={rainWayStyles.rainWayEntryCard}>
                  <Text style={rainWayStyles.rainWayEntryDate}>
                    {note.date}
                  </Text>
                  <Text
                    style={rainWayStyles.rainWayEntrySnippet}
                    numberOfLines={3}
                  >
                    {note.text}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => onDailyRightsOpenNote(note)}
                  activeOpacity={0.8}
                  style={rainWayStyles.rainWayOpenButtonWrap}
                >
                  <ImageBackground
                    source={require('../RainBornAssets/images/onboard/button.png')}
                    style={[
                      rainWayStyles.rainWayOnboardStyleButton,
                      rainWayStyles.rainWayOpenButton,
                    ]}
                  >
                    <Image
                      source={require('../RainBornAssets/images/opn.png')}
                    />
                  </ImageBackground>
                </TouchableOpacity>
              </ImageBackground>
            ))}
            <TouchableOpacity
              onPress={onDailyRightsAddNote}
              activeOpacity={0.8}
              style={rainWayStyles.rainWayAddNoteButtonWrap}
            >
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={rainWayStyles.rainWayOnboardStyleButton}
              >
                <Image
                  source={require('../RainBornAssets/images/addNote.png')}
                />
              </ImageBackground>
            </TouchableOpacity>
          </View>
        )}

        <Modal
          visible={!!dailyRightsSelectedNote}
          transparent
          animationType="fade"
          onRequestClose={onDailyRightsCloseNote}
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
          <View style={rainWayStyles.rainWayViewNoteOverlay}>
            <View style={rainWayStyles.rainWayViewNoteContent}>
              <View style={rainWayStyles.rainWayViewNoteHeader}>
                <Text style={rainWayStyles.rainWayViewNoteDate}>
                  {dailyRightsSelectedNote?.date}
                </Text>
                <TouchableOpacity
                  onPress={onDailyRightsCloseNote}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={rainWayStyles.rainWayViewNoteCloseBtn}
                >
                  <Image
                    source={require('../RainBornAssets/images/cls.png')}
                    style={rainWayStyles.rainWayCloseIcon}
                  />
                </TouchableOpacity>
              </View>
              <View style={rainWayStyles.rainWayViewNoteScrollContent}>
                <View style={rainWayStyles.rainWayViewNoteCard}>
                  <View
                    style={{
                      padding: 16,
                      borderWidth: 1,
                      borderColor: '#FFFFFF33',
                      borderRadius: 6,
                      marginBottom: 16,
                    }}
                  >
                    <Text style={rainWayStyles.rainWayViewNoteText}>
                      {dailyRightsSelectedNote?.text}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={onDailyRightsDeleteNote}
                    style={rainWayStyles.rainWayDeleteNoteWrap}
                  >
                    <Image
                      source={require('../RainBornAssets/images/delete.png')}
                    />
                    <Text style={rainWayStyles.rainWayDeleteNoteText}>
                      Delete note
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                onPress={onDailyRightsShareNote}
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
  rainWayBackground: { flex: 1 },
  rainWayCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a3a1a',
  },
  rainWayLoadingText: { color: '#fff', fontFamily: 'Nunito-Regular' },
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
  rainWayHeaderBack: { position: 'absolute', left: 16 },
  rainWayHeaderTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: '#E87850',
    letterSpacing: 0.5,
  },
  rainWayEmptyState: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  rainWayAvatarWrap: {
    marginTop: 30,
    marginBottom: 20,
  },
  rainWayEntryCardBg: {
    width: 386,
    height: 386,
    resizeMode: 'contain',
  },
  rainWayAvatar: {
    width: '100%',
    height: '100%',
  },
  rainWayEmptyTitle1: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: '#fff',
    marginBottom: 4,
  },
  rainWayEmptyTitle2: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: '#E87850',
    marginBottom: 16,
    textAlign: 'center',
  },
  rainWayEmptyParagraph: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: '#D9D9D9',
    marginBottom: 32,
    width: '80%',
    marginTop: 20,
  },
  rainWayAddNoteButtonWrap: { marginTop: 8 },
  rainWayOnboardStyleButton: {
    width: 236,
    height: 74,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  rainWayOnboardStyleButtonText: {
    fontSize: 24,
    color: 'rgba(169, 22, 0, 1)',
    fontFamily: 'Nunito-Black',
  },
  rainWayAddNoteScreen: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  rainWayNotePanel: {
    backgroundColor: '#123509',
    borderRadius: 6,
    padding: 35,
    width: '92%',
    alignSelf: 'center',
    minHeight: 400,
    marginTop: 10,
    marginBottom: 10,
  },
  rainWayNoteDate: {
    fontFamily: 'Nunito-Black',
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
  },
  rainWayNoteInput: {
    flex: 1,
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    minHeight: 200,
  },
  rainWaySaveButtonWrap: { alignSelf: 'center', marginVertical: 20 },
  rainWayListScroll: { flex: 1, alignItems: 'center', paddingBottom: 20 },
  rainWayListContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  rainWayCalendarButtonWrap: {
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  rainWayCalendarScreen: {
    paddingHorizontal: 26,
    paddingTop: 16,
    paddingBottom: 24,
  },
  rainWayChooseDayText: {
    fontFamily: 'Nunito-Black',
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  rainWayCalendarBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
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
  rainWayDayCellSelected: {
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
  rainWayNoEntriesText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  rainWayCalendarCardsWrap: { marginTop: 8, alignItems: 'center' },
  rainWayEntryCard: {
    padding: 20,
    paddingHorizontal: 80,
    paddingTop: 80,
    marginBottom: 16,
  },
  rainWayEntryDate: {
    fontFamily: 'Nunito-Black',
    fontSize: 20,
    color: '#fff',
    marginBottom: 8,
  },
  rainWayEntrySnippet: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: 'rgb(255, 255, 255)',
    lineHeight: 22,
    marginBottom: 16,
  },
  rainWayOpenButtonWrap: {
    alignSelf: 'center',
    position: 'absolute',
    bottom: 60,
  },
  rainWayOpenButton: { marginTop: 4 },
  rainWayViewNoteOverlay: {
    flex: 1,
    backgroundColor: '#000000D1',
    justifyContent: 'center',
    padding: 20,
  },
  rainWayViewNoteContent: {
    backgroundColor: 'transparent',
    maxHeight: '87%',
  },
  rainWayViewNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  rainWayViewNoteDate: {
    fontFamily: 'Nunito-Black',
    fontSize: 20,
    color: '#FFFFFF',
    textShadowColor: 'rgba(245, 166, 35, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  rainWayViewNoteCloseBtn: {
    padding: 4,
  },
  rainWayCloseIcon: { width: 28, height: 28 },
  rainWayViewNoteScroll: { flex: 1 },
  rainWayViewNoteScrollContent: { paddingBottom: 16 },
  rainWayViewNoteCard: {
    backgroundColor: '#123509',
    borderRadius: 6,
    padding: 35,
    borderWidth: 0,
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
  },
  rainWayViewNoteText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'left',
  },
  rainWayDeleteNoteWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'flex-start',
    gap: 8,
  },
  rainWayDeleteNoteIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  rainWayDeleteNoteText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: '#E53935',
    textDecorationLine: 'underline',
  },
  rainWayShareButtonWrap: { alignSelf: 'center', marginTop: 8 },
});

export default RainBornPathJournal;
