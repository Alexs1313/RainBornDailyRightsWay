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
import Orientation from 'react-native-orientation-locker';
import TouchableOpacity from '../RainBornComponents/RainBornAnimatedTouchable';

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
  const navigation = useNavigation();
  const [notes, setNotes] = useState<JournalNote[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedNote, setSelectedNote] = useState<JournalNote | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(
    null,
  );

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android' && !!selectedNote) {
        Orientation.lockToPortrait();
      }

      return () => Orientation.unlockAllOrientations();
    }, [!!selectedNote]),
  );

  const loadNotes = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setNotes(Array.isArray(parsed) ? parsed : []);
      } else {
        setNotes([]);
      }
    } catch (_) {
      setNotes([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const saveNotes = useCallback(async (nextNotes: JournalNote[]) => {
    setNotes(nextNotes);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextNotes));
    } catch (_) {}
  }, []);

  const goBack = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
  }, [navigation]);

  const onAddNote = useCallback(() => {
    setNewNoteText('');
    setShowAddNote(true);
  }, []);

  const onSaveNote = useCallback(() => {
    const text = newNoteText.trim();
    if (!text) return;
    const note: JournalNote = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date: formatDate(new Date()),
      text,
    };
    saveNotes([note, ...notes]);
    setNewNoteText('');
    setShowAddNote(false);
  }, [newNoteText, notes, saveNotes]);

  const onOpenNote = useCallback((note: JournalNote) => {
    setSelectedNote(note);
  }, []);

  const onCloseNote = useCallback(() => {
    setSelectedNote(null);
  }, []);

  const onDeleteNote = useCallback(() => {
    if (!selectedNote) return;
    saveNotes(notes.filter(n => n.id !== selectedNote.id));
    setSelectedNote(null);
  }, [selectedNote, notes, saveNotes]);

  const onShareNote = useCallback(async () => {
    if (!selectedNote) return;
    try {
      await Share.share({
        title: `Journal ${selectedNote.date}`,
        message: selectedNote.text,
      });
    } catch (_) {}
  }, [selectedNote]);

  if (!loaded) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>...</Text>
      </View>
    );
  }

  const isEmpty = notes.length === 0;

  return (
    <ImageBackground
      source={
        isEmpty
          ? require('../RainBornAssets/images/empybg.png')
          : require('../RainBornAssets/images/bgs/main.png')
      }
      style={styles.background}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={
              showCalendar
                ? () => {
                    setShowCalendar(false);
                    setSelectedCalendarDate(null);
                  }
                : goBack
            }
            activeOpacity={0.8}
            style={styles.headerBack}
          >
            <Image source={require('../RainBornAssets/images/back.png')} />
          </TouchableOpacity>
          {showCalendar ? (
            <Image
              source={require('../RainBornAssets/images/calendarttl.png')}
            />
          ) : (
            <Text style={styles.headerTitle}>
              {showAddNote ? (
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

        {showCalendar ? (
          <View style={styles.calendarScreen}>
            <Text style={styles.chooseDayText}>CHOOSE A DAY:</Text>
            <View style={styles.calendarBox}>
              <View style={styles.calendarBoxHeader}>
                <Text style={styles.calendarMonthYear}>
                  {MONTH_NAMES[calendarMonth.getMonth()]}{' '}
                  {calendarMonth.getFullYear()}
                </Text>
                <View style={styles.calendarNav}>
                  <TouchableOpacity
                    onPress={() =>
                      setCalendarMonth(
                        new Date(
                          calendarMonth.getFullYear(),
                          calendarMonth.getMonth() - 1,
                        ),
                      )
                    }
                    style={styles.calendarNavBtn}
                  >
                    <Text style={styles.calendarNavArrow}>‹</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      setCalendarMonth(
                        new Date(
                          calendarMonth.getFullYear(),
                          calendarMonth.getMonth() + 1,
                        ),
                      )
                    }
                    style={styles.calendarNavBtn}
                  >
                    <Text style={styles.calendarNavArrow}>›</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.weekdayRow}>
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                  <Text key={d} style={styles.weekdayCell}>
                    {d}
                  </Text>
                ))}
              </View>
              <View style={styles.daysGrid}>
                {getCalendarDays(
                  calendarMonth.getFullYear(),
                  calendarMonth.getMonth(),
                ).map((d, i) => {
                  const isSelected =
                    selectedCalendarDate &&
                    selectedCalendarDate.getDate() === d &&
                    selectedCalendarDate.getMonth() ===
                      calendarMonth.getMonth() &&
                    selectedCalendarDate.getFullYear() ===
                      calendarMonth.getFullYear();
                  if (d === null) {
                    return <View key={`e-${i}`} style={styles.dayCell} />;
                  }
                  return (
                    <TouchableOpacity
                      key={`d-${d}`}
                      style={styles.dayCell}
                      onPress={() =>
                        setSelectedCalendarDate(
                          new Date(
                            calendarMonth.getFullYear(),
                            calendarMonth.getMonth(),
                            d,
                          ),
                        )
                      }
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.dayCellCircle,
                          isSelected && styles.dayCellSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayCellText,
                            isSelected && styles.dayCellTextSelected,
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
            {selectedCalendarDate &&
              (() => {
                const dateStr = formatDate(selectedCalendarDate);
                const notesForDay = notes.filter(n => n.date === dateStr);
                if (notesForDay.length === 0) {
                  return (
                    <Text style={styles.noEntriesText}>
                      No entries for this day
                    </Text>
                  );
                }
                return (
                  <View style={styles.calendarCardsWrap}>
                    {notesForDay.map(note => (
                      <ImageBackground
                        source={require('../RainBornAssets/images/onboard/textboard.png')}
                        style={styles.entryCardBg}
                        resizeMode="contain"
                        key={note.id}
                      >
                        <View style={styles.entryCard}>
                          <Text style={styles.entryDate}>{note.date}</Text>
                          <Text style={styles.entrySnippet} numberOfLines={3}>
                            {note.text}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            setShowCalendar(false);
                            onOpenNote(note);
                          }}
                          activeOpacity={0.8}
                          style={styles.openButtonWrap}
                        >
                          <ImageBackground
                            source={require('../RainBornAssets/images/onboard/button.png')}
                            style={[
                              styles.onboardStyleButton,
                              styles.openButton,
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
        ) : showAddNote ? (
          <View style={styles.addNoteScreen}>
            <View style={styles.notePanel}>
              <Text style={styles.noteDate}>{formatDate(new Date())}</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="HOW ARE YOU NOW?"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={newNoteText}
                onChangeText={setNewNoteText}
                multiline
                textAlignVertical="top"
              />
            </View>
            {newNoteText && (
              <TouchableOpacity
                onPress={onSaveNote}
                activeOpacity={0.8}
                style={styles.saveButtonWrap}
              >
                <ImageBackground
                  source={require('../RainBornAssets/images/onboard/button.png')}
                  style={styles.onboardStyleButton}
                >
                  <Image
                    source={require('../RainBornAssets/images/SAVE.png')}
                  />
                </ImageBackground>
              </TouchableOpacity>
            )}
          </View>
        ) : isEmpty ? (
          <View style={styles.emptyState}>
            <View style={styles.avatarWrap}>
              <Image
                source={require('../RainBornAssets/images/welcomeimg.png')}
              />
            </View>
            <Image
              source={require('../RainBornAssets/images/welcometxt.png')}
            />
            <Text style={styles.emptyParagraph}>
              Add the first entry to the journal, and don't forget to share your
              thoughts here, I'm here and will accept any opinion you have.
            </Text>
            <TouchableOpacity
              onPress={onAddNote}
              activeOpacity={0.8}
              style={styles.addNoteButtonWrap}
            >
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={styles.onboardStyleButton}
              >
                <Image
                  source={require('../RainBornAssets/images/addNote.png')}
                />
              </ImageBackground>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listScroll}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.calendarButtonWrap}
              onPress={() => {
                const today = new Date();
                setCalendarMonth(today);
                setSelectedCalendarDate(today);
                setShowCalendar(true);
              }}
            >
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={styles.onboardStyleButton}
              >
                <Image
                  source={require('../RainBornAssets/images/CALENDAR.png')}
                />
              </ImageBackground>
            </TouchableOpacity>
            {notes.map(note => (
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/textboard.png')}
                style={styles.entryCardBg}
                resizeMode="contain"
                key={note.id}
              >
                <View style={styles.entryCard}>
                  <Text style={styles.entryDate}>{note.date}</Text>
                  <Text style={styles.entrySnippet} numberOfLines={3}>
                    {note.text}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => onOpenNote(note)}
                  activeOpacity={0.8}
                  style={styles.openButtonWrap}
                >
                  <ImageBackground
                    source={require('../RainBornAssets/images/onboard/button.png')}
                    style={[styles.onboardStyleButton, styles.openButton]}
                  >
                    <Image
                      source={require('../RainBornAssets/images/opn.png')}
                    />
                  </ImageBackground>
                </TouchableOpacity>
              </ImageBackground>
            ))}
            <TouchableOpacity
              onPress={onAddNote}
              activeOpacity={0.8}
              style={styles.addNoteButtonWrap}
            >
              <ImageBackground
                source={require('../RainBornAssets/images/onboard/button.png')}
                style={styles.onboardStyleButton}
              >
                <Image
                  source={require('../RainBornAssets/images/addNote.png')}
                />
              </ImageBackground>
            </TouchableOpacity>
          </View>
        )}

        <Modal
          visible={!!selectedNote}
          transparent
          animationType="fade"
          onRequestClose={onCloseNote}
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
          <View style={styles.viewNoteOverlay}>
            <View style={styles.viewNoteContent}>
              <View style={styles.viewNoteHeader}>
                <Text style={styles.viewNoteDate}>{selectedNote?.date}</Text>
                <TouchableOpacity
                  onPress={onCloseNote}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={styles.viewNoteCloseBtn}
                >
                  <Image
                    source={require('../RainBornAssets/images/cls.png')}
                    style={styles.closeIcon}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.viewNoteScrollContent}>
                <View style={styles.viewNoteCard}>
                  <View
                    style={{
                      padding: 16,
                      borderWidth: 1,
                      borderColor: '#FFFFFF33',
                      borderRadius: 6,
                      marginBottom: 16,
                    }}
                  >
                    <Text style={styles.viewNoteText}>
                      {selectedNote?.text}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={onDeleteNote}
                    style={styles.deleteNoteWrap}
                  >
                    <Image
                      source={require('../RainBornAssets/images/delete.png')}
                    />
                    <Text style={styles.deleteNoteText}>Delete note</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                onPress={onShareNote}
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
  background: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a3a1a',
  },
  loadingText: { color: '#fff', fontFamily: 'Nunito-Regular' },
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
  headerBack: { position: 'absolute', left: 16 },
  headerTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: '#E87850',
    letterSpacing: 0.5,
  },
  emptyState: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  avatarWrap: {
    marginTop: 30,
    marginBottom: 20,
  },
  entryCardBg: {
    width: 386,
    height: 386,
    resizeMode: 'contain',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  emptyTitle1: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: '#fff',
    marginBottom: 4,
  },
  emptyTitle2: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: '#E87850',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyParagraph: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: '#D9D9D9',
    marginBottom: 32,
    width: '80%',
    marginTop: 20,
  },
  addNoteButtonWrap: { marginTop: 8 },
  onboardStyleButton: {
    width: 236,
    height: 74,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  onboardStyleButtonText: {
    fontSize: 24,
    color: 'rgba(169, 22, 0, 1)',
    fontFamily: 'Nunito-Black',
  },
  addNoteScreen: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  notePanel: {
    backgroundColor: '#123509',
    borderRadius: 6,
    padding: 35,
    width: '92%',
    alignSelf: 'center',
    minHeight: 400,
    marginTop: 10,
    marginBottom: 10,
  },
  noteDate: {
    fontFamily: 'Nunito-Black',
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
  },
  noteInput: {
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
  saveButtonWrap: { alignSelf: 'center', marginVertical: 20 },
  listScroll: { flex: 1, alignItems: 'center', paddingBottom: 20 },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  calendarButtonWrap: { alignSelf: 'center', marginBottom: 20, marginTop: 20 },
  calendarScreen: {
    paddingHorizontal: 26,
    paddingTop: 16,
    paddingBottom: 24,
  },
  chooseDayText: {
    fontFamily: 'Nunito-Black',
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  calendarBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  calendarBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calendarMonthYear: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: '#000',
  },
  calendarNav: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  calendarNavBtn: { padding: 8 },
  calendarNavArrow: {
    fontSize: 24,
    color: '#2196F3',
    fontFamily: 'Nunito-Bold',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    fontFamily: 'Nunito-Regular',
    fontSize: 11,
    color: '#757575',
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,

    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    backgroundColor: 'rgba(0, 123, 255, 0.12)',
  },
  dayCellText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 15,
    color: '#000',
  },
  dayCellTextSelected: {
    fontFamily: 'Nunito-Regular',
    color: '#007AFF',
  },
  noEntriesText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  calendarCardsWrap: { marginTop: 8, alignItems: 'center' },
  entryCard: {
    padding: 20,
    paddingHorizontal: 80,
    paddingTop: 80,
    marginBottom: 16,
  },
  entryDate: {
    fontFamily: 'Nunito-Black',
    fontSize: 20,
    color: '#fff',
    marginBottom: 8,
  },
  entrySnippet: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: 'rgb(255, 255, 255)',
    lineHeight: 22,
    marginBottom: 16,
  },
  openButtonWrap: { alignSelf: 'center', position: 'absolute', bottom: 60 },
  openButton: { marginTop: 4 },
  viewNoteOverlay: {
    flex: 1,
    backgroundColor: '#000000D1',
    justifyContent: 'center',
    padding: 20,
  },
  viewNoteContent: {
    backgroundColor: 'transparent',
    maxHeight: '87%',
  },
  viewNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  viewNoteDate: {
    fontFamily: 'Nunito-Black',
    fontSize: 20,
    color: '#FFFFFF',
    textShadowColor: 'rgba(245, 166, 35, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  viewNoteCloseBtn: {
    padding: 4,
  },
  closeIcon: { width: 28, height: 28 },
  viewNoteScroll: { flex: 1 },
  viewNoteScrollContent: { paddingBottom: 16 },
  viewNoteCard: {
    backgroundColor: '#123509',
    borderRadius: 6,
    padding: 35,
    borderWidth: 0,
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
  },
  viewNoteText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'left',
  },
  deleteNoteWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'flex-start',
    gap: 8,
  },
  deleteNoteIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  deleteNoteText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: '#E53935',
    textDecorationLine: 'underline',
  },
  shareButtonWrap: { alignSelf: 'center', marginTop: 8 },
});

export default RainBornPathJournal;
