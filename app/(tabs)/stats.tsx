import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Modal, Platform } from 'react-native';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { BOOKS } from '../../constants/dummy';

const { width } = Dimensions.get('window');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL_MONTHS = [
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

export default function StatsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempYear, setTempYear] = useState(currentDate.getFullYear());

    // Read 상태인 책이나 임의의 책 목록을 가져옴 (더미 데이터)
    const readBooks = BOOKS.slice(0, 4);

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

    const today = new Date();
    const isNextMonthDisabled =
        currentDate.getFullYear() > today.getFullYear() ||
        (currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() >= today.getMonth());

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
                        <Text style={styles.headerTitle}>
                            {FULL_MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </Text>
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
                                <Text style={styles.statsCardValue}>4</Text>
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
                            <Text style={styles.statsCardFooterValue}>45</Text>
                        </View>
                        <View style={styles.statsCardFooterItem}>
                            <Text style={styles.statsCardFooterLabel}>Total Thoughts</Text>
                            <Text style={styles.statsCardFooterValue}>12</Text>
                        </View>
                    </View>
                </View>

                {/* Read in Month Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Read in {FULL_MONTHS[currentDate.getMonth()]}</Text>
                </View>

                <View style={styles.bookList}>
                    {readBooks.map((book) => (
                        <TouchableOpacity
                            key={book.id}
                            style={styles.bookCard}
                            activeOpacity={0.9}
                            onPress={() => router.push({ pathname: '/book/[id]', params: { id: book.id } })}
                        >
                            <View style={styles.bookCoverWrapper}>
                                <Image source={{ uri: book.coverUrl }} style={styles.bookCover} />
                                <View style={styles.bookCoverGradient} />
                            </View>

                            <View style={styles.bookInfo}>
                                <View>
                                    <View style={styles.bookTitleRow}>
                                        <Text style={styles.bookTitle} numberOfLines={1}>
                                            {book.title}
                                        </Text>
                                        <MaterialIcons name="check-circle" size={16} color="#22c55e" />
                                    </View>
                                    <Text style={styles.bookAuthor} numberOfLines={1}>
                                        {book.author}
                                    </Text>

                                    <View style={styles.ratingRow}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <MaterialIcons
                                                key={star}
                                                name={star <= 4 ? 'star' : 'star-border'}
                                                size={14}
                                                color="#facc15"
                                            />
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.bookStatsRow}>
                                    <View style={styles.bookStatItem}>
                                        <MaterialIcons name="format-quote" size={14} color="#306ee8" />
                                        <Text style={styles.bookStatText}>{book.quotesCount}</Text>
                                    </View>
                                    <View style={styles.bookStatDivider} />
                                    <View style={styles.bookStatItem}>
                                        <MaterialIcons name="edit-note" size={14} color="#306ee8" />
                                        <Text style={styles.bookStatText}>{Math.floor(book.quotesCount / 3) + 1}</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
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
                                style={[styles.modalIconBtn, tempYear >= today.getFullYear() && { opacity: 0.3 }]}
                                disabled={tempYear >= today.getFullYear()}
                            >
                                <MaterialIcons name="chevron-right" size={28} color="#0f172a" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.monthGrid}>
                            {MONTHS.map((month, index) => {
                                const isSelected =
                                    currentDate.getFullYear() === tempYear && currentDate.getMonth() === index;
                                const isFutureMonth =
                                    tempYear > today.getFullYear() ||
                                    (tempYear === today.getFullYear() && index > today.getMonth());

                                return (
                                    <TouchableOpacity
                                        key={month}
                                        style={[
                                            styles.monthItem,
                                            isSelected && styles.monthItemActive,
                                            isFutureMonth && styles.monthItemDisabled,
                                        ]}
                                        onPress={() => handleSelectMonth(index)}
                                        disabled={isFutureMonth}
                                    >
                                        <Text
                                            style={[
                                                styles.monthText,
                                                isSelected && styles.monthTextActive,
                                                isFutureMonth && styles.monthTextDisabled,
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
    statsCardBgDecoration: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: 'rgba(48, 110, 232, 0.05)',
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
    viewAllText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#306ee8',
    },
    bookList: {
        gap: 16,
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
    ratingRow: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 2,
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
    bookStatDivider: {
        width: 1,
        height: 12,
        backgroundColor: '#cbd5e1',
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
