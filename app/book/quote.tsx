import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Platform,
    Dimensions,
    Alert,
    Keyboard,
} from 'react-native';
import { useState, useRef, useCallback } from 'react';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { apiQuotes } from '../../features/quote/api/api';
import { apiThoughts } from '../../features/thought/api/api';
import { formatDateYMD, formatTime } from '@/utils/date';
import { useBottomSheetBackdrop } from '@/hooks/useBottomSheetBackdrop';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { HIT_SLOP_DEFAULT, getBottomSheetPadding } from '@/constants/ui';

const { width } = Dimensions.get('window');

export default function QuoteDetailScreen() {
    const router = useRouter();
    const { quoteId } = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const quoteIdStr = Array.isArray(quoteId) ? quoteId[0] : (quoteId as string);
    const keyboardHeight = useKeyboardHeight();
    const bottomSheetPadding = getBottomSheetPadding(insets);

    const [quote, setQuote] = useState<any>(null);
    const [thought, setThought] = useState('');

    const [currentQuoteText, setCurrentQuoteText] = useState('');
    const [editingQuote, setEditingQuote] = useState(false);
    const [editedQuoteText, setEditedQuoteText] = useState('');

    const [events, setEvents] = useState<any[]>([]);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const [editedEventContent, setEditedEventContent] = useState('');

    const fetchData = useCallback(async () => {
        if (!quoteIdStr) return;
        try {
            const qId = Number(quoteIdStr);
            const qData = await apiQuotes.getQuoteById(qId);
            setQuote(qData);
            setCurrentQuoteText((prev) => (editingQuote ? prev : qData.text));
            const tData = await apiThoughts.getThoughtsByQuoteId(qId);
            setEvents(tData || []);
        } catch (e) {
            console.error('Failed to fetch quote details', e);
        }
    }, [quoteIdStr, editingQuote]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData]),
    );

    const scrollViewRef = useRef<ScrollView>(null);
    const [eventYPositions, setEventYPositions] = useState<{ [key: string]: number }>({});

    const quoteOptionsSheetRef = useRef<BottomSheetModal>(null);
    const quoteEditConfirmSheetRef = useRef<BottomSheetModal>(null);
    const thoughtActionSheetRef = useRef<BottomSheetModal>(null);
    const thoughtOptionsSheetRef = useRef<BottomSheetModal>(null);
    const pendingThoughtEventRef = useRef<any>(null);
    const quoteEditActionRef = useRef<'save' | 'cancel' | null>(null);
    const renderBackdrop = useBottomSheetBackdrop();

    const startEditingQuote = () => {
        setEditedQuoteText(currentQuoteText);
        setEditingQuote(true);
    };

    const handleQuoteBlur = () => {
        if (editedQuoteText !== currentQuoteText) {
            quoteEditConfirmSheetRef.current?.present();
        } else {
            setEditingQuote(false);
        }
    };

    const handleQuoteEditCancel = () => {
        quoteEditActionRef.current = 'cancel';
        setEditedQuoteText(currentQuoteText);
        setEditingQuote(false);
        quoteEditConfirmSheetRef.current?.dismiss();
    };

    const handleQuoteEditConfirm = () => {
        if (!editedQuoteText.trim()) {
            Alert.alert('Error', 'Quote cannot be empty.');
            return;
        }
        quoteEditActionRef.current = 'save';
        quoteEditConfirmSheetRef.current?.dismiss();
        apiQuotes
            .updateQuote(Number(quoteIdStr), { text: editedQuoteText })
            .then(() => {
                setCurrentQuoteText(editedQuoteText);
                setEditingQuote(false);
            })
            .catch((e) => {
                console.error('Update quote failed:', e);
                Alert.alert('Error', 'Failed to update quote.');
                setEditedQuoteText(currentQuoteText);
                setEditingQuote(false);
            });
    };

    const openThoughtOptions = (event: any) => {
        pendingThoughtEventRef.current = event;
        thoughtOptionsSheetRef.current?.present();
    };

    const startEditingEvent = (event: any) => {
        thoughtOptionsSheetRef.current?.dismiss();
        setEditedEventContent(event.text);
        setEditingEventId(event.id);

        setTimeout(() => {
            if (scrollViewRef.current && eventYPositions[event.id] !== undefined) {
                scrollViewRef.current.scrollTo({ y: eventYPositions[event.id] - 100, animated: true });
            }
        }, 150);
    };

    const deleteThought = useCallback(
        (event: { id: number }, onDismiss?: () => void) => {
            onDismiss?.();
            apiThoughts
                .deleteThought(event.id)
                .then(() => {
                    setEvents((prev) => prev.filter((e) => e.id !== event.id));
                    setEditingEventId(null);
                    pendingThoughtEventRef.current = null;
                })
                .catch(() => {
                    Alert.alert('Error', 'Failed to delete thought.');
                    pendingThoughtEventRef.current = null;
                });
        },
        [],
    );

    const handleThoughtOptionDelete = () => {
        const event = pendingThoughtEventRef.current;
        if (!event) return;
        deleteThought(event, () => thoughtOptionsSheetRef.current?.dismiss());
    };

    const handleEventBlur = (event: any) => {
        if (editedEventContent !== event.text) {
            pendingThoughtEventRef.current = event;
            thoughtActionSheetRef.current?.present();
        } else {
            setEditingEventId(null);
        }
    };

    const handleThoughtActionCancel = () => {
        setEditingEventId(null);
        pendingThoughtEventRef.current = null;
        thoughtActionSheetRef.current?.dismiss();
    };

    const handleThoughtActionSave = () => {
        const event = pendingThoughtEventRef.current;
        if (!event) return;
        thoughtActionSheetRef.current?.dismiss();
        apiThoughts
            .updateThought(event.id, editedEventContent)
            .then(() => {
                setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, text: editedEventContent } : e)));
                setEditingEventId(null);
                pendingThoughtEventRef.current = null;
            })
            .catch((e) => {
                console.error('Update thought failed:', e);
                Alert.alert('Error', 'Failed to update thought.');
                setEditingEventId(null);
                pendingThoughtEventRef.current = null;
            });
    };

    const handleThoughtActionDelete = () => {
        const event = pendingThoughtEventRef.current;
        if (!event) return;
        deleteThought(event, () => thoughtActionSheetRef.current?.dismiss());
    };

    const handleMorePress = () => quoteOptionsSheetRef.current?.present();

    const handleQuoteDelete = () => {
        quoteOptionsSheetRef.current?.dismiss();
        apiQuotes
            .deleteQuote(Number(quoteIdStr))
            .then(() => router.back())
            .catch((e) => Alert.alert('Error', 'Failed to delete quote.'));
    };

    const handleSend = async () => {
        if (!thought.trim()) {
            Alert.alert('Empty Thought', 'Please type something before sending.');
            return;
        }
        try {
            await apiThoughts.createThought({ quote_id: Number(quoteIdStr), text: thought.trim() });
            Keyboard.dismiss();
            setThought('');
            fetchData();
        } catch (e) {
            console.error('Failed to create thought', e);
            Alert.alert('Error', 'Failed to add thought.');
        }
    };

    if (!quote)
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <Text>Loading...</Text>
            </View>
        );

    return (
        <View style={[styles.container, { paddingBottom: keyboardHeight }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Quote Sentence</Text>

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
                        <Text style={styles.pageNumberText}>
                            {quote?.page_number ? `PAGE ${quote.page_number}` : ''}
                        </Text>
                        {editingQuote ? (
                            <TouchableOpacity style={styles.editActionBtn} onPress={() => Keyboard.dismiss()}>
                                <MaterialIcons name="check" size={20} color="#1754cf" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.editActionBtn} onPress={startEditingQuote}>
                                <MaterialIcons name="edit" size={18} color="#94a3b8" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.quoteWrapper}>
                        <MaterialIcons
                            name="format-quote"
                            size={36}
                            color="rgba(23, 84, 207, 0.2)"
                            style={styles.quoteIconLeft}
                        />
                        {editingQuote ? (
                            <TextInput
                                key="quote-edit"
                                style={styles.quoteText}
                                multiline
                                value={editedQuoteText}
                                onChangeText={setEditedQuoteText}
                                onBlur={handleQuoteBlur}
                                autoFocus
                                scrollEnabled={false}
                            />
                        ) : (
                            <TextInput
                                key="quote-view"
                                style={styles.quoteText}
                                multiline
                                value={currentQuoteText}
                                editable={false}
                                scrollEnabled={false}
                            />
                        )}
                        <MaterialIcons
                            name="format-quote"
                            size={36}
                            color="rgba(23, 84, 207, 0.2)"
                            style={styles.quoteIconRight}
                        />
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
                            {events.map((event) => (
                                <View
                                    key={event.id}
                                    style={styles.timelineRow}
                                    onLayout={(e) => {
                                        const y = e.nativeEvent.layout.y;
                                        setEventYPositions((prev) => ({ ...prev, [event.id]: y + 250 }));
                                    }}
                                >
                                    {/* Timeline Node */}
                                    <View style={styles.timelineNodeContainer}>
                                        <View style={styles.timelineNode}>
                                            <MaterialIcons name={'chat-bubble-outline'} size={16} color="#64748b" />
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
                                                        style={styles.eventContent}
                                                        multiline
                                                        value={editedEventContent}
                                                        onChangeText={setEditedEventContent}
                                                        onBlur={() => handleEventBlur(event)}
                                                        autoFocus
                                                        scrollEnabled={false}
                                                    />
                                                ) : (
                                                    <TextInput
                                                        key={`event-view-${event.id}`}
                                                        style={styles.eventContent}
                                                        multiline
                                                        value={event.text}
                                                        editable={false}
                                                        scrollEnabled={false}
                                                    />
                                                )}

                                                <View style={styles.eventEditBtn}>
                                                    {editingEventId === event.id ? (
                                                        <TouchableOpacity
                                                            onPress={() => Keyboard.dismiss()}
                                                            hitSlop={HIT_SLOP_DEFAULT}
                                                        >
                                                            <MaterialIcons name="check" size={18} color="#1754cf" />
                                                        </TouchableOpacity>
                                                    ) : (
                                                        <TouchableOpacity
                                                            onPress={() => openThoughtOptions(event)}
                                                            hitSlop={HIT_SLOP_DEFAULT}
                                                        >
                                                            <MaterialIcons
                                                                name="more-horiz"
                                                                size={18}
                                                                color="#94a3b8"
                                                            />
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            </View>

                                            <View style={styles.eventFooter}>
                                                <Text style={styles.eventDate}>{formatDateYMD(event.created_at)}</Text>
                                                <View style={styles.eventDot} />
                                                <Text style={styles.eventDate}>{formatTime(event.created_at)}</Text>
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
            <View
                style={[styles.bottomInputContainer, { paddingBottom: keyboardHeight > 0 ? 12 : insets.bottom || 24 }]}
            >
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="내 생각을 남겨보세요..."
                        placeholderTextColor="#94a3b8"
                        value={thought}
                        onChangeText={setThought}
                    />
                    <TouchableOpacity style={styles.sendButton} activeOpacity={0.8} onPress={handleSend}>
                        <MaterialIcons
                            name="send"
                            size={18}
                            color="#ffffff"
                            style={{ transform: [{ rotate: '-45deg' }, { translateX: 2 }, { translateY: -2 }] }}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Quote Options Bottom Sheet */}
            <BottomSheetModal ref={quoteOptionsSheetRef} enableDynamicSizing backdropComponent={renderBackdrop}>
                <BottomSheetView style={[styles.bottomSheetContent, { paddingBottom: bottomSheetPadding }]}>
                    <View style={styles.bottomSheetHeader}>
                        <Text style={styles.bottomSheetTitle}>인용 문장</Text>
                        <TouchableOpacity
                            onPress={() => quoteOptionsSheetRef.current?.dismiss()}
                            style={styles.bottomSheetCloseBtn}
                        ></TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.bottomSheetOption} onPress={handleQuoteDelete}>
                        <Text style={styles.bottomSheetOptionDestructive}>삭제하기</Text>
                    </TouchableOpacity>
                </BottomSheetView>
            </BottomSheetModal>

            {/* Quote Edit Confirm Bottom Sheet */}
            <BottomSheetModal
                ref={quoteEditConfirmSheetRef}
                enableDynamicSizing
                backdropComponent={renderBackdrop}
                onDismiss={() => {
                    if (quoteEditActionRef.current !== 'save') {
                        setEditedQuoteText(currentQuoteText);
                        setEditingQuote(false);
                    }
                    quoteEditActionRef.current = null;
                }}
            >
                <BottomSheetView style={[styles.bottomSheetContent, { paddingBottom: bottomSheetPadding }]}>
                    <View style={styles.bottomSheetHeader}>
                        <Text style={styles.bottomSheetTitle}>수정할까요?</Text>
                        <TouchableOpacity onPress={handleQuoteEditCancel} style={styles.bottomSheetCloseBtn}>
                            <MaterialIcons name="close" size={24} color="#0f172a" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.bottomSheetOption} onPress={handleQuoteEditCancel}>
                        <Text style={styles.bottomSheetOptionText}>취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bottomSheetOption} onPress={handleQuoteEditConfirm}>
                        <Text style={[styles.bottomSheetOptionText, { color: '#1754cf', fontWeight: '600' }]}>
                            저장
                        </Text>
                    </TouchableOpacity>
                </BottomSheetView>
            </BottomSheetModal>

            {/* Thought Options Bottom Sheet */}
            <BottomSheetModal ref={thoughtOptionsSheetRef} enableDynamicSizing backdropComponent={renderBackdrop}>
                <BottomSheetView style={[styles.bottomSheetContent, { paddingBottom: bottomSheetPadding }]}>
                    <View style={styles.bottomSheetHeader}>
                        <Text style={styles.bottomSheetTitle}>내 생각</Text>
                        <TouchableOpacity
                            onPress={() => thoughtOptionsSheetRef.current?.dismiss()}
                            style={styles.bottomSheetCloseBtn}
                        >
                            <MaterialIcons name="close" size={24} color="#0f172a" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={styles.bottomSheetOption}
                        onPress={() => startEditingEvent(pendingThoughtEventRef.current)}
                    >
                        <Text style={styles.bottomSheetOptionText}>수정하기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bottomSheetOption} onPress={handleThoughtOptionDelete}>
                        <Text style={styles.bottomSheetOptionDestructive}>삭제하기</Text>
                    </TouchableOpacity>
                </BottomSheetView>
            </BottomSheetModal>

            {/* Thought Action Bottom Sheet */}
            <BottomSheetModal
                ref={thoughtActionSheetRef}
                enableDynamicSizing
                backdropComponent={renderBackdrop}
                onDismiss={() => {
                    setEditingEventId(null);
                    pendingThoughtEventRef.current = null;
                }}
            >
                <BottomSheetView style={[styles.bottomSheetContent, { paddingBottom: bottomSheetPadding }]}>
                    <View style={styles.bottomSheetHeader}>
                        <Text style={styles.bottomSheetTitle}>
                            {!editedEventContent.trim() ? '삭제할까요?' : '수정할까요?'}
                        </Text>
                        <TouchableOpacity onPress={handleThoughtActionCancel} style={styles.bottomSheetCloseBtn}>
                            <MaterialIcons name="close" size={24} color="#0f172a" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.bottomSheetOption} onPress={handleThoughtActionCancel}>
                        <Text style={styles.bottomSheetOptionText}>취소</Text>
                    </TouchableOpacity>
                    {!editedEventContent.trim() ? (
                        <TouchableOpacity style={styles.bottomSheetOption} onPress={handleThoughtActionDelete}>
                            <Text style={styles.bottomSheetOptionDestructive}>삭제하기</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.bottomSheetOption} onPress={handleThoughtActionSave}>
                            <Text style={[styles.bottomSheetOptionText, { color: '#1754cf', fontWeight: '600' }]}>
                                저장
                            </Text>
                        </TouchableOpacity>
                    )}
                </BottomSheetView>
            </BottomSheetModal>
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
        paddingTop: 24,
        paddingBottom: 48,
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
        marginBottom: 36,
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
        minHeight: 52,
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
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        margin: 0,
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
        left: 16 + 23,
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
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 8,
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
        borderRadius: 30,
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
        minHeight: 44,
        lineHeight: 20,
        fontSize: 16,
        color: '#0f172a',
        paddingVertical: 0,
        marginRight: 12,
        textAlignVertical: 'center',
    },
    sendButton: {
        width: 44,
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
    bottomSheetContent: {
        paddingHorizontal: 20,
        paddingBottom: 32,
    },
    bottomSheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    bottomSheetTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0f172a',
    },
    bottomSheetCloseBtn: {
        padding: 4,
    },
    bottomSheetOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 4,
    },
    bottomSheetOptionText: {
        fontSize: 16,
        color: '#475569',
    },
    bottomSheetOptionDestructive: {
        fontSize: 16,
        color: '#dc2626',
        fontWeight: '500',
    },
});
