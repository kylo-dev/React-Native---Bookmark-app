import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Platform,
    TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';
import { apiBooks } from '../../features/book/api/api';
import { StatusBar } from 'expo-status-bar';
import { LIBRARY_FILTER_OPTIONS } from '@/constants/book-status';

const { width } = Dimensions.get('window');
const COLUMN_GAP = 16;
const PADDING_HORIZONTAL = 16;
const CARD_WIDTH = ((width - PADDING_HORIZONTAL * 2 - COLUMN_GAP) / 2) * 0.92;
const LIST_COVER_WIDTH = 56;
const LIST_COVER_HEIGHT = LIST_COVER_WIDTH * 1.45;

const COVER_BG = '#e2e8f0';
const QUOTE_BADGE_ACTIVE_THRESHOLD = 10;

type ViewMode = 'grid' | 'list';

const goToBookDetail = (router: any, id: number) => {
    router.push({ pathname: '/book/[id]', params: { id: id.toString() } });
};

function QuoteBadge({ count }: { count: number }) {
    const isActive = count >= QUOTE_BADGE_ACTIVE_THRESHOLD;
    return (
        <View style={[styles.quoteBadge, isActive && styles.quoteBadgeActive]}>
            <MaterialIcons
                name="format-quote"
                size={12}
                color={isActive ? '#306ee8' : '#64748b'}
            />
            <Text style={[styles.quoteText, isActive && styles.quoteTextActive]}>{count} quotes</Text>
        </View>
    );
}

function BookCover({
    coverUrl,
    iconSize,
    imageStyle,
}: {
    coverUrl: string | null;
    iconSize: number;
    imageStyle: object;
}) {
    return coverUrl ? (
        <Image style={imageStyle} source={{ uri: coverUrl }} resizeMode="contain" />
    ) : (
        <View style={styles.coverPlaceholder}>
            <MaterialIcons name="menu-book" size={iconSize} color="#94a3b8" />
        </View>
    );
}

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState('all');
    const [books, setBooks] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    const filteredBooks = searchQuery.trim()
        ? books.filter(
              (b) =>
                  b.title?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
                  b.author?.toLowerCase().includes(searchQuery.toLowerCase().trim()),
          )
        : books;

    const fetchBooks = async (filter: string | undefined) => {
        try {
            const data = await apiBooks.getBooks(filter === 'all' ? undefined : filter);
            setBooks(data || []);
        } catch (e) {
            console.error('Fetch books failed:', e);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBooks(activeFilter);
        }, [activeFilter]),
    );

    const renderBookItemGrid = ({ item }: { item: any }) => {
        const quotesCount = item.quotes?.[0]?.count || 0;
        return (
            <TouchableOpacity
                style={styles.cardContainer}
                activeOpacity={0.8}
                onPress={() => goToBookDetail(router, item.id)}
            >
                <View style={styles.coverWrapper}>
                    <BookCover coverUrl={item.cover_url} iconSize={48} imageStyle={styles.coverImage} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.cardAuthor} numberOfLines={1}>{item.author}</Text>
                    <QuoteBadge count={quotesCount} />
                </View>
            </TouchableOpacity>
        );
    };

    const renderBookItemList = ({ item }: { item: any }) => {
        const quotesCount = item.quotes?.[0]?.count || 0;
        return (
            <TouchableOpacity
                style={styles.listRow}
                activeOpacity={0.8}
                onPress={() => goToBookDetail(router, item.id)}
            >
                <View style={styles.listCoverWrapper}>
                    <BookCover coverUrl={item.cover_url} iconSize={28} imageStyle={styles.listCoverImage} />
                </View>
                <View style={styles.listCardInfo}>
                    <Text style={styles.listCardTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.listCardAuthor} numberOfLines={1}>{item.author}</Text>
                    <QuoteBadge count={quotesCount} />
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#cbd5e1" style={styles.listArrow} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                {isSearchMode ? (
                    <View style={styles.searchBarContainer}>
                        <MaterialIcons name="search" size={22} color="#94a3b8" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="책 제목 또는 저자로 검색"
                            placeholderTextColor="#94a3b8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        <TouchableOpacity
                            onPress={() => {
                                setIsSearchMode(false);
                                setSearchQuery('');
                            }}
                            style={styles.searchCloseBtn}
                        >
                            <MaterialIcons name="close" size={22} color="#64748b" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View>
                            <Text style={styles.headerTitle}>My Library</Text>
                        </View>
                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                style={styles.headerIconBtn}
                                onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            >
                                <MaterialIcons
                                    name={viewMode === 'grid' ? 'view-list' : 'view-module'}
                                    size={24}
                                    color="#475569"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.headerIconBtn} onPress={() => setIsSearchMode(true)}>
                                <MaterialIcons name="search" size={24} color="#475569" />
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>

            {/* Main Content */}
            <View style={styles.main}>
                <View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterScrollConfig}
                        style={styles.filterScroll}
                    >
                        {LIBRARY_FILTER_OPTIONS.map((filter) => {
                            const isActive = activeFilter === filter.value;
                            return (
                                <TouchableOpacity
                                    key={filter.value}
                                    style={[styles.filterItem, isActive && styles.filterItemActive]}
                                    onPress={() => setActiveFilter(filter.value)}
                                >
                                    <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                                        {filter.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                <FlatList
                    key={viewMode}
                    data={filteredBooks}
                    renderItem={viewMode === 'grid' ? renderBookItemGrid : renderBookItemList}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={viewMode === 'grid' ? 2 : 1}
                    contentContainerStyle={[
                        styles.listParams,
                        filteredBooks.length === 0 && styles.emptyGridParams,
                    ]}
                    columnWrapperStyle={viewMode === 'grid' && filteredBooks.length > 0 ? styles.gridRow : undefined}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyStateContainer}>
                            <MaterialIcons
                                name={searchQuery.trim() ? 'search-off' : 'library-books'}
                                size={64}
                                color="#cbd5e1"
                            />
                            <Text style={styles.emptyStateTitle}>
                                {searchQuery.trim() ? '검색 결과가 없습니다' : '아직 등록된 책이 없습니다'}
                            </Text>
                            <Text style={styles.emptyStateDesc}>
                                {searchQuery.trim()
                                    ? '다른 검색어로 시도해보세요'
                                    : '+ 버튼을 눌러 새로운 책을 추가해보세요!'}
                            </Text>
                        </View>
                    }
                />
            </View>

            {/* FAB */}
            <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => router.push('/book/register')}>
                <MaterialIcons name="add" size={28} color="#ffffff" />
            </TouchableOpacity>
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
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: PADDING_HORIZONTAL,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(226, 232, 240, 0.5)',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    headerIconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBarContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        backgroundColor: '#e2e8f0',
        borderRadius: 22,
        paddingHorizontal: 16,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#0f172a',
        paddingVertical: 0,
    },
    searchCloseBtn: {
        padding: 4,
    },
    main: {
        flex: 1,
    },
    filterScroll: {
        flexGrow: 0,
        marginBottom: 20,
    },
    filterScrollConfig: {
        paddingHorizontal: PADDING_HORIZONTAL,
        paddingTop: 16,
        paddingBottom: 4,
        gap: 12,
    },
    filterItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#e2e8f0',
    },
    filterItemActive: {
        backgroundColor: '#306ee8',
        shadowColor: '#306ee8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#475569',
    },
    filterTextActive: {
        color: '#ffffff',
    },
    listParams: {
        paddingHorizontal: PADDING_HORIZONTAL,
        paddingBottom: 100,
    },
    listRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
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
    listCoverWrapper: {
        width: LIST_COVER_WIDTH,
        height: LIST_COVER_HEIGHT,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: COVER_BG,
    },
    listCoverImage: {
        width: '100%',
        height: '100%',
        padding: 6,
    },
    listCardInfo: {
        flex: 1,
        marginLeft: 14,
        justifyContent: 'center',
    },
    listCardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 4,
    },
    listCardAuthor: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
        marginBottom: 8,
    },
    listArrow: {
        marginLeft: 8,
    },
    gridRow: {
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    cardContainer: {
        width: CARD_WIDTH,
    },
    coverWrapper: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.5, // Aspect ratio 2/3
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: COVER_BG,
        marginBottom: 10,
    },
    coverImage: {
        width: '100%',
        height: '100%',
        padding: 8,
    },
    coverPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COVER_BG,
    },
    cardInfo: {
        paddingHorizontal: 4,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 3,
    },
    cardAuthor: {
        fontSize: 13,
        fontWeight: '500',
        color: '#64748b',
        marginBottom: 6,
    },
    quoteBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
        backgroundColor: '#e2e8f0',
        gap: 3,
    },
    quoteBadgeActive: {
        backgroundColor: 'rgba(48, 110, 232, 0.1)',
    },
    quoteText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748b',
    },
    quoteTextActive: {
        color: '#306ee8',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#306ee8',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#306ee8',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    emptyGridParams: {
        flexGrow: 1,
        justifyContent: 'center',
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
    },
});
