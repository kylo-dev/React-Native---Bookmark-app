import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Platform } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useFocusEffect } from 'expo-router';
import { apiBooks } from '../../features/book/api/api';
import { apiQuotes } from '../../features/quote/api/api';

import { MONTHS, FULL_MONTHS, formatMonthYear } from '../../constants/date';
import { isFutureMonth, isMonthAtOrAfterCurrent } from '@/utils/date';

export default function StatsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempYear, setTempYear] = useState(currentDate.getFullYear());

    const [readBooks, setReadBooks] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalRead: 0, totalQuotes: 0, totalThoughts: 0 });

    const fetchStats = useCallback(async () => {
        try {
            const targetMonth = currentDate.getMonth();
            const targetYear = currentDate.getFullYear();

            const [filteredBooks, monthQuotes] = await Promise.all([
                apiBooks.getBooksByMonth(targetYear, targetMonth),
                apiQuotes.getQuotesByMonth(targetYear, targetMonth),
            ]);

            const monthQuotesCount = monthQuotes.length;
            const tCount = monthQuotes.reduce((acc, q) => acc + (q.thoughts?.[0]?.count ?? 0), 0);

            setReadBooks(filteredBooks);
            setStats({
                totalRead: filteredBooks.length,
                totalQuotes: monthQuotesCount,
                totalThoughts: tCount,
            });
        } catch (e) {
            console.error('Failed to fetch stats', e);
        }
    }, [currentDate]);

    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [fetchStats]),
    );

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handlePrevMonth = () => {
        setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const openDatePicker = () => {
        setTempYear(currentDate.getFullYear());
        setShowDatePicker(true);
    };

    const handleSelectMonth = (monthIndex: number) => {
        setCurrentDate(new Date(tempYear, monthIndex, 1));
        setShowDatePicker(false);
    };

    const isNextMonthDisabled = isMonthAtOrAfterCurrent(currentDate.getFullYear(), currentDate.getMonth());

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity style={styles.iconButton} onPress={handlePrevMonth}>
                    <MaterialIcons name="chevron-left" size={28} color="#64748b" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.headerTitleContainer} activeOpacity={0.7} onPress={openDatePicker}>
                    <Text style={styles.headerSubtitle}>MONTHLY LOG</Text>
                    <View style={styles.headerTitleRow}>
                        <Text style={styles.headerTitle}>{formatMonthYear(currentDate)}</Text>
                        <MaterialIcons name="expand-more" size={20} color="#0f172a" style={{ opacity: 0.5 }} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.iconButton, isNextMonthDisabled && { opacity: 0.3 }]}
                    onPress={handleNextMonth}
                    disabled={isNextMonthDisabled}
                >
                    <MaterialIcons name="chevron-right" size={28} color="#64748b" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Main Stats Card */}
                <View style={styles.statsCard}>
                    <View style={styles.statsCardHeader}>
                        <View>
                            <Text style={styles.statsCardTitle}>Total Books Read</Text>
                            <View style={styles.statsCardValueRow}>
                                <Text style={styles.statsCardValue}>{stats.totalRead}</Text>
                                <Text style={styles.statsCardUnit}>books</Text>
                            </View>
                        </View>
                        <View style={styles.statsCardIconWrapper}>
                            <MaterialIcons name="menu-book" size={24} color="#306ee8" />
                        </View>
                    </View>

                    <View style={styles.statsCardFooter}>
                        <View style={styles.statsCardFooterItem}>
                            <Text style={styles.statsCardFooterLabel}>Total Quotes</Text>
                            <Text style={styles.statsCardFooterValue}>{stats.totalQuotes}</Text>
                        </View>
                        <View style={styles.statsCardFooterItem}>
                            <Text style={styles.statsCardFooterLabel}>Total Thoughts</Text>
                            <Text style={styles.statsCardFooterValue}>{stats.totalThoughts}</Text>
                        </View>
                    </View>
                </View>

                {/* Read in Month Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{FULL_MONTHS[currentDate.getMonth()]}에 읽은 책</Text>
                </View>

                <View style={styles.bookList}>
                    {readBooks.length === 0 ? (
                        <View style={styles.emptyBookList}>
                            <MaterialIcons name="menu-book" size={48} color="#cbd5e1" />
                            <Text style={styles.emptyBookListText}>이 달에 읽은 책이 없습니다</Text>
                        </View>
                    ) : (
                        readBooks.map((book) => {
                            const qCount = book.quotes?.[0]?.count || 0;
                            return (
                                <TouchableOpacity
                                    key={book.id.toString()}
                                    style={styles.bookCard}
                                    activeOpacity={0.9}
                                    onPress={() =>
                                        router.push({ pathname: '/book/[id]', params: { id: book.id.toString() } })
                                    }
                                >
                                    <View style={styles.bookCoverWrapper}>
                                        <Image
                                            source={book.cover_url ? { uri: book.cover_url } : undefined}
                                            style={styles.bookCover}
                                        />
                                        <View style={styles.bookCoverGradient} />
                                    </View>

                                    <View style={styles.bookInfo}>
                                        <View>
                                            <View style={styles.bookTitleRow}>
                                                <Text style={styles.bookTitle} numberOfLines={1}>
                                                    {book.title}
                                                </Text>
                                            </View>
                                            <Text style={styles.bookAuthor} numberOfLines={1}>
                                                {book.author}
                                            </Text>
                                        </View>

                                        <View style={styles.bookStatsRow}>
                                            <View style={styles.bookStatItem}>
                                                <MaterialIcons name="format-quote" size={14} color="#306ee8" />
                                                <Text style={styles.bookStatText}>{qCount}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/* Month/Year Picker Modal */}
            <Modal
                visible={showDatePicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDatePicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowDatePicker(false)}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                onPress={() => setTempYear((prev) => prev - 1)}
                                style={styles.modalIconBtn}
                            >
                                <MaterialIcons name="chevron-left" size={28} color="#0f172a" />
                            </TouchableOpacity>
                            <Text style={styles.modalYearText}>{tempYear}</Text>
                            <TouchableOpacity
                                onPress={() => setTempYear((prev) => prev + 1)}
                                style={[styles.modalIconBtn, tempYear >= new Date().getFullYear() && { opacity: 0.3 }]}
                                disabled={tempYear >= new Date().getFullYear()}
                            >
                                <MaterialIcons name="chevron-right" size={28} color="#0f172a" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.monthGrid}>
                            {MONTHS.map((month, index) => {
                                const isSelected =
                                    currentDate.getFullYear() === tempYear && currentDate.getMonth() === index;
                                const disabled = isFutureMonth(tempYear, index);

                                return (
                                    <TouchableOpacity
                                        key={month}
                                        style={[
                                            styles.monthItem,
                                            isSelected && styles.monthItemActive,
                                            disabled && styles.monthItemDisabled,
                                        ]}
                                        onPress={() => handleSelectMonth(index)}
                                        disabled={disabled}
                                    >
                                        <Text
                                            style={[
                                                styles.monthText,
                                                isSelected && styles.monthTextActive,
                                                disabled && styles.monthTextDisabled,
                                            ]}
                                        >
                                            {month}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc', // background-light
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
        zIndex: 20,
        backgroundColor: '#f8fafc',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleContainer: {
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        letterSpacing: 1,
        marginBottom: 2,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    statsCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 24,
        marginBottom: 32,
        marginTop: 8,
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    statsCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        position: 'relative',
        zIndex: 10,
    },
    statsCardTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
        marginBottom: 4,
    },
    statsCardValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    statsCardValue: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#306ee8',
    },
    statsCardUnit: {
        fontSize: 16,
        color: '#64748b',
    },
    statsCardIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(48, 110, 232, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsCardFooter: {
        flexDirection: 'row',
        gap: 32,
        marginTop: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    statsCardFooterItem: {
        flex: 1,
    },
    statsCardFooterLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
    },
    statsCardFooterValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    bookList: {
        gap: 16,
    },
    emptyBookList: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyBookListText: {
        fontSize: 15,
        color: '#94a3b8',
        marginTop: 12,
    },
    bookCard: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        gap: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    bookCoverWrapper: {
        width: 72,
        height: 104,
        borderRadius: 8,
        backgroundColor: '#e2e8f0',
        overflow: 'hidden',
    },
    bookCover: {
        width: '100%',
        height: '100%',
    },
    bookCoverGradient: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    bookInfo: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    bookTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
    },
    bookTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    bookAuthor: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    bookStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
        gap: 12,
    },
    bookStatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    bookStatText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#0f172a',
    },

    /* Modal Styles */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalIconBtn: {
        padding: 8,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
    },
    modalYearText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    monthGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    monthItem: {
        width: '30%',
        paddingVertical: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#f8fafc',
    },
    monthItemActive: {
        backgroundColor: '#306ee8',
    },
    monthText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#475569',
        textAlign: 'center',
        includeFontPadding: false,
    },
    monthTextActive: {
        color: '#ffffff',
    },
    monthItemDisabled: {
        opacity: 0.5,
    },
    monthTextDisabled: {
        color: '#94a3b8',
    },
});
