import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform, Dimensions, Alert, Keyboard } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SENTENCES } from '../../constants/dummy';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const TIMELINE_EVENTS = [
  {
    id: '1',
    type: 'quote',
    content: "This reminds me of the concept of 'Eternal Return'. The way the author describes the cyclic nature of time here is profound.",
    date: 'Oct 12',
    time: '10:30 AM',
    icon: 'format-quote'
  },
  {
    id: '2',
    type: 'link',
    content: "Cross-reference with page 42. There seems to be a contradiction in how the character is portrayed.",
    date: 'Oct 14',
    time: '2:15 PM',
    icon: 'link'
  }
];

export default function SentenceDetailScreen() {
  const router = useRouter();
  const { sentenceId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const sentence = SENTENCES.find(s => s.id === sentenceId) || SENTENCES[0];
  const [thought, setThought] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [currentSentenceText, setCurrentSentenceText] = useState(sentence.text);
  const [editingSentence, setEditingSentence] = useState(false);
  const [editedSentenceText, setEditedSentenceText] = useState('');

  const [events, setEvents] = useState(TIMELINE_EVENTS);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editedEventContent, setEditedEventContent] = useState('');
  
  const scrollViewRef = useRef<ScrollView>(null);
  const [eventYPositions, setEventYPositions] = useState<{ [key: string]: number }>({});

  const startEditingSentence = () => {
    setEditedSentenceText(currentSentenceText);
    setEditingSentence(true);
  };

  const handleSentenceBlur = () => {
    if (editedSentenceText !== currentSentenceText) {
      Alert.alert(
        'Do you want to edit?',
        '',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              // Cancel 버튼을 누르면 기존 텍스트로 복원하고 수정 모드 종료
              setEditedSentenceText(currentSentenceText);
              setEditingSentence(false);
            }
          },
          {
            text: 'OK',
            onPress: () => {
              if (!editedSentenceText.trim()) {
                Alert.alert('Error', 'Sentence cannot be empty.');
                setEditedSentenceText(currentSentenceText);
                setEditingSentence(false);
                return;
              }
              setCurrentSentenceText(editedSentenceText);
              setEditingSentence(false);
            }
          }
        ]
      );
    } else {
      setEditingSentence(false);
    }
  };

  const startEditingEvent = (event: typeof TIMELINE_EVENTS[0]) => {
    setEditedEventContent(event.content);
    setEditingEventId(event.id);

    // 약간의 딜레이 후 해당 컴포넌트 위치로 스크롤
    setTimeout(() => {
      if (scrollViewRef.current && eventYPositions[event.id] !== undefined) {
        scrollViewRef.current.scrollTo({ y: eventYPositions[event.id] - 100, animated: true });
      }
    }, 150);
  };

  const handleEventBlur = (event: typeof TIMELINE_EVENTS[0]) => {
    if (editedEventContent !== event.content) {
      Alert.alert(
        'Do you want to edit?',
        '',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setEditingEventId(null);
            }
          },
          {
            text: 'OK',
            onPress: () => {
              if (!editedEventContent.trim()) {
                Alert.alert('Error', 'Thought cannot be empty.');
                setEditingEventId(null);
                return;
              }
              setEvents(prev => prev.map(e => e.id === event.id ? { ...e, content: editedEventContent } : e));
              setEditingEventId(null);
            }
          }
        ]
      );
    } else {
      setEditingEventId(null);
    }
  };

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleMorePress = () => {
    Alert.alert(
      'Record Options',
      'Choose an action',
      [
        { text: 'Edit Sentence', onPress: () => Alert.alert('Edit feature coming soon! (Dummy)') },
        { text: 'Delete Sentence', onPress: () => Alert.alert('Deleted! (Dummy)', '', [{ text: 'OK', onPress: () => router.back() }]), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleSend = () => {
    if (!thought.trim()) {
      Alert.alert('Empty Thought', 'Please type something before sending.');
      return;
    }
    Alert.alert('Success', 'Thought added! (Dummy)', [
      { text: 'OK', onPress: () => setThought('') }
    ]);
  };

  return (
    <View style={[styles.container, { paddingBottom: keyboardHeight }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Passage Details</Text>
        
        <TouchableOpacity style={styles.iconButton} onPress={handleMorePress}>
          <MaterialIcons name="more-horiz" size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Quote Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroHeader}>
            <Text style={styles.pageNumberText}>PAGE 112</Text>
            {editingSentence ? (
              <TouchableOpacity style={styles.editActionBtn} onPress={() => Keyboard.dismiss()}>
                <MaterialIcons name="check" size={20} color="#1754cf" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.editActionBtn} onPress={startEditingSentence}>
                <MaterialIcons name="edit" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.quoteWrapper}>
            <MaterialIcons name="format-quote" size={48} color="rgba(23, 84, 207, 0.2)" style={styles.quoteIconLeft} />
            {editingSentence ? (
              <TextInput 
                key="quote-edit"
                style={[styles.quoteText, styles.editQuoteInput]}
                multiline
                value={editedSentenceText}
                onChangeText={setEditedSentenceText}
                onBlur={handleSentenceBlur}
                autoFocus
              />
            ) : (
              <TextInput 
                key="quote-view"
                style={[styles.quoteText, styles.editQuoteInput]}
                multiline
                value={currentSentenceText}
                editable={false}
                scrollEnabled={false}
              />
            )}
            <MaterialIcons name="format-quote" size={48} color="rgba(23, 84, 207, 0.2)" style={styles.quoteIconRight} />
          </View>
        </View>

        {/* Timeline Section */}
        <View style={styles.timelineContainer}>
          {events.length === 0 ? (
            <View style={[styles.emptyStateContainer, { paddingTop: 40 }]}>
              <MaterialIcons name="chat" size={48} color="#cbd5e1" />
              <Text style={styles.emptyStateTitle}>아직 기록된 생각이 없습니다</Text>
              <Text style={styles.emptyStateDesc}>
                아래 입력창을 통해 문장에 대한 내 생각을 남겨보세요!
              </Text>
            </View>
          ) : (
            <>
              {/* Timeline Line */}
              <View style={styles.timelineLine} />

              {/* Timeline Events */}
              {events.map((event, index) => (
                <View 
                  key={event.id} 
                  style={styles.timelineRow}
                  onLayout={(e) => {
                    const y = e.nativeEvent.layout.y;
                    // timelineContainer 내부 좌표이므로 상단 heroSection 높이를 대략 더해줌
                    setEventYPositions(prev => ({ ...prev, [event.id]: y + 250 }));
                  }}
                >
                  {/* Timeline Node */}
                  <View style={styles.timelineNodeContainer}>
                    <View style={styles.timelineNode}>
                      <MaterialIcons name={event.icon as any} size={16} color="#64748b" />
                    </View>
                  </View>

                  {/* Event Card */}
                  <View style={styles.eventCardContainer}>
                    {/* Pointer Arrow */}
                    <View style={styles.eventCardPointer} />
                    
                      <View style={styles.eventCard}>
                      <View style={styles.eventHeader}>
                        {editingEventId === event.id ? (
                          <TextInput 
                            key={`event-edit-${event.id}`}
                            style={[styles.eventContent, styles.editEventInput]}
                            multiline
                            value={editedEventContent}
                            onChangeText={setEditedEventContent}
                            onBlur={() => handleEventBlur(event)}
                            autoFocus
                          />
                        ) : (
                          <TextInput 
                            key={`event-view-${event.id}`}
                            style={[styles.eventContent, styles.editEventInput]}
                            multiline
                            value={event.content}
                            editable={false}
                            scrollEnabled={false}
                          />
                        )}
                        
                        <View style={styles.eventEditBtn}>
                          {editingEventId === event.id ? (
                            <TouchableOpacity onPress={() => Keyboard.dismiss()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                              <MaterialIcons name="check" size={18} color="#1754cf" />
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity onPress={() => startEditingEvent(event)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                              <MaterialIcons name="edit" size={16} color="#94a3b8" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                      
                      <View style={styles.eventFooter}>
                        <Text style={styles.eventDate}>{event.date}</Text>
                        <View style={styles.eventDot} />
                        <Text style={styles.eventDate}>{event.time}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}

              {/* End Node */}
              <View style={styles.timelineRow}>
                <View style={styles.timelineNodeContainer}>
                  <View style={styles.timelineEndNode}>
                    <MaterialIcons name="edit-note" size={18} color="#1754cf" />
                  </View>
                </View>

                <View style={styles.eventCardContainer}>
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyCardText}>Your thoughts continue here...</Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom Input */}
      <View style={[styles.bottomInputContainer, { paddingBottom: keyboardHeight > 0 ? 12 : (insets.bottom || 24) }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Add a thought..."
            placeholderTextColor="#94a3b8"
            value={thought}
            onChangeText={setThought}
          />
          <TouchableOpacity style={styles.sendButton} activeOpacity={0.8} onPress={handleSend}>
            <MaterialIcons name="send" size={18} color="#ffffff" style={{ transform: [{ rotate: '-45deg' }, { translateX: 2 }, { translateY: -2 }] }} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: 'rgba(246, 246, 248, 0.9)',
    zIndex: 20,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 24, // move up
    paddingBottom: 48, // keep same distance from bottom components
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.6)',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
    marginBottom: 16,
  },
  editActionBtn: {
    position: 'absolute',
    right: 0,
    top: -4,
    padding: 4,
  },
  pageNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 2,
  },
  quoteWrapper: {
    paddingHorizontal: 16,
    position: 'relative',
    maxWidth: width * 0.85,
  },
  quoteIconLeft: {
    position: 'absolute',
    top: -32,
    left: -16,
  },
  quoteIconRight: {
    position: 'absolute',
    bottom: -32,
    right: -16,
    transform: [{ rotate: '180deg' }],
  },
  quoteText: {
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '500',
    color: '#1e293b',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  editQuoteInput: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    margin: 0,
    textAlign: 'center',
  },
  timelineContainer: {
    paddingHorizontal: 16,
    paddingTop: 32,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    top: 32,
    bottom: 0,
    left: 16 + 23, // container padding + relative center of icon col
    width: 2,
    backgroundColor: '#e2e8f0',
    zIndex: -1,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineNodeContainer: {
    width: 48,
    alignItems: 'center',
    paddingTop: 8,
  },
  timelineNode: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#f6f6f8',
  },
  timelineEndNode: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(23, 84, 207, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#f6f6f8',
  },
  eventCardContainer: {
    flex: 1,
    paddingLeft: 16,
    paddingBottom: 32,
    paddingTop: 8,
    position: 'relative',
  },
  eventCardPointer: {
    position: 'absolute',
    top: 24,
    left: 9,
    width: 14,
    height: 14,
    backgroundColor: '#ffffff',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    transform: [{ rotate: '45deg' }],
    zIndex: 1,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  eventContent: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#1e293b',
    fontWeight: '500',
    paddingRight: 8,
  },
  editEventInput: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    margin: 0,
    textAlignVertical: 'top',
  },
  eventEditBtn: {
    paddingLeft: 4,
    paddingTop: 2,
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  eventDate: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
  },
  emptyCard: {
    height: 96,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCardText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  bottomInputContainer: {
    backgroundColor: '#f6f6f8',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingTop: 16,
    zIndex: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 30, // scaled for taller input
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  textInput: {
    flex: 1,
    minHeight: 44, // match button height
    lineHeight: 20,
    fontSize: 16,
    color: '#0f172a',
    paddingVertical: 0, 
    marginRight: 12,
    textAlignVertical: 'center', // perfect centering for Android
  },
  sendButton: {
    width: 44, // slightly larger to match text layout
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1754cf',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#1754cf',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDesc: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
