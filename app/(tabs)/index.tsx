import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { BOOKS } from '../../constants/dummy';

const { width } = Dimensions.get('window');
const COLUMN_GAP = 16;
const PADDING_HORIZONTAL = 16;
const CARD_WIDTH = (width - PADDING_HORIZONTAL * 2 - COLUMN_GAP) / 2;

const FILTER_OPTIONS = ['All Books', 'Reading', 'Finished', 'Cancelled'];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All Books');

  const filteredBooks = BOOKS.filter(book => 
    activeFilter === 'All Books' ? true : book.status === activeFilter
  );

  const renderBookItem = ({ item }: { item: typeof BOOKS[0] }) => (
    <TouchableOpacity 
      style={styles.cardContainer} 
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: '/book/[id]', params: { id: item.id } })}
    >
      <View style={styles.coverWrapper}>
        <Image style={styles.coverImage} source={{ uri: item.coverUrl }} />
        <View style={styles.coverGradient} />
        {item.hasFavorite && (
          <View style={styles.favoriteBadge}>
            <MaterialIcons name="favorite" size={16} color="#306ee8" />
          </View>
        )}
      </View>
      
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardAuthor} numberOfLines={1}>{item.author}</Text>
        
        <View style={[styles.quoteBadge, item.quotesCount >= 10 && styles.quoteBadgeActive]}>
          <MaterialIcons 
            name="format-quote" 
            size={14} 
            color={item.quotesCount >= 10 ? '#306ee8' : '#64748b'} 
          />
          <Text style={[styles.quoteText, item.quotesCount >= 10 && styles.quoteTextActive]}>
            {item.quotesCount} quotes
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>WELCOME BACK</Text>
          <Text style={styles.headerTitle}>My Library</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <MaterialIcons name="search" size={24} color="#475569" />
        </TouchableOpacity>
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
            {FILTER_OPTIONS.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <TouchableOpacity 
                  key={filter}
                  style={[styles.filterItem, isActive && styles.filterItemActive]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <FlatList
          data={filteredBooks}
          renderItem={renderBookItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={[styles.gridParams, filteredBooks.length === 0 && styles.emptyGridParams]}
          columnWrapperStyle={filteredBooks.length > 0 ? styles.gridRow : undefined}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <MaterialIcons name="library-books" size={64} color="#cbd5e1" />
              <Text style={styles.emptyStateTitle}>아직 등록된 책이 없습니다</Text>
              <Text style={styles.emptyStateDesc}>
                + 버튼을 눌러 새로운 책을 추가해보세요!
              </Text>
            </View>
          }
        />
      </View>

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8}
        onPress={() => router.push('/book/register')}
      >
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
  welcomeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#306ee8',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
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
  gridParams: {
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingBottom: 100, // space for fab
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  cardContainer: {
    width: CARD_WIDTH,
  },
  coverWrapper: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.5, // Aspect ratio 2/3
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  favoriteBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardInfo: {
    paddingHorizontal: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  cardAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 8,
  },
  quoteBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
    gap: 4,
  },
  quoteBadgeActive: {
    backgroundColor: 'rgba(48, 110, 232, 0.1)',
  },
  quoteText: {
    fontSize: 12,
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
