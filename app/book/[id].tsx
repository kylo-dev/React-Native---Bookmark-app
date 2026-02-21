import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { BOOKS, QUOTES } from '../../constants/dummy';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const book = BOOKS.find(b => b.id === id) || BOOKS[0];
  const [favoriteQuotes, setFavoriteQuotes] = useState<Record<string, boolean>>({});

  const toggleFavorite = (quoteId: string) => {
    setFavoriteQuotes(prev => ({
      ...prev,
      [quoteId]: !prev[quoteId]
    }));
  };

  const handleMorePress = () => {
    Alert.alert(
      'Book Options',
      'Choose an action',
      [
        { text: 'Edit Book Info', onPress: () => router.push({ pathname: '/book/register', params: { bookId: id } }) },
        { text: 'Delete Book', onPress: () => Alert.alert('Deleted! (Dummy)', '', [{ text: 'OK', onPress: () => router.back() }]), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleStatusPress = () => {
    Alert.alert(
      'Change Status',
      'Select book status',
      [
        { text: 'Reading', onPress: () => Alert.alert('Status changed to Reading! (Dummy)') },
        { text: 'Finished', onPress: () => Alert.alert('Status changed to Finished! (Dummy)') },
        { text: 'Cancelled', onPress: () => Alert.alert('Status changed to Cancelled! (Dummy)') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton} onPress={handleMorePress}>
          <MaterialIcons name="more-horiz" size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.coverShadow}>
            <View style={styles.coverWrapper}>
              <Image 
                source={{ uri: book.coverUrl }} 
                style={styles.coverImage} 
              />
            </View>
          </View>
          
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>{book.author}</Text>
          
          <TouchableOpacity style={styles.statusBadge} activeOpacity={0.8} onPress={handleStatusPress}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{book.status || 'Reading'}</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Section Title */}
        <View style={styles.quotesHeader}>
          <Text style={styles.quotesTitle}>Memorable Quotes</Text>
          <Text style={styles.quotesCount}>Total {QUOTES.length}</Text>
        </View>

        {/* Quotes List */}
        <View style={styles.quotesList}>
          {QUOTES.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <MaterialIcons name="format-quote" size={48} color="#cbd5e1" />
              <Text style={styles.emptyStateTitle}>아직 기록된 문장이 없습니다</Text>
              <Text style={styles.emptyStateDesc}>
                아래 버튼을 눌러 기억하고 싶은 문장을 남겨보세요!
              </Text>
            </View>
          ) : (
            QUOTES.map((quote) => (
              <TouchableOpacity 
                key={quote.id} 
                style={styles.quoteCard} 
                activeOpacity={0.9}
                onPress={() => router.push({ pathname: '/book/quote', params: { bookId: id, quoteId: quote.id } })}
              >
                <TouchableOpacity 
                  style={styles.favoriteBadge}
                  onPress={() => toggleFavorite(quote.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialIcons 
                    name={favoriteQuotes[quote.id] ? "favorite" : "favorite-border"} 
                    size={20} 
                    color={favoriteQuotes[quote.id] ? "#306ee8" : "#cbd5e1"} 
                  />
                </TouchableOpacity>

                <Text style={styles.quoteText} numberOfLines={3}>
                  {quote.text}
                </Text>
                
                <View style={styles.quoteFooter}>
                  <Text style={styles.dateText}>{quote.date}</Text>
                  
                  <View style={styles.thoughtBadgeContainer}>
                    <View style={styles.thoughtBadge}>
                      <MaterialIcons name="chat-bubble-outline" size={16} color="#94a3b8" />
                      <Text style={styles.thoughtCount}>{quote.thoughtsCount}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
          
          {/* Spacer for bottom action button */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Fixed Bottom Action */}
      <View style={[styles.bottomActionContainer, { paddingBottom: insets.bottom || 24 }]}>
        <TouchableOpacity 
          style={styles.recordButton} 
          activeOpacity={0.8}
          onPress={() => router.push({ pathname: '/book/new-record', params: { bookId: id } })}
        >
          <MaterialIcons name="edit-note" size={24} color="#ffffff" />
          <Text style={styles.recordButtonText}>Record New Quote</Text>
        </TouchableOpacity>
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
    paddingVertical: 12,
    zIndex: 20,
    backgroundColor: '#f6f6f8',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  coverShadow: {
    marginBottom: 24,
  },
  coverWrapper: {
    width: 160,
    height: 240,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  author: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(48, 110, 232, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(48, 110, 232, 0.2)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#306ee8',
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#306ee8',
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
  quotesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  quotesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  quotesCount: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  quotesList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  quoteCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  favoriteBadge: {
    position: 'absolute',
    top: 22, // aligned with first line of text (padding 20 + half of leading diff)
    right: 20,
    zIndex: 10,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
    fontStyle: 'italic',
    marginBottom: 16,
    paddingRight: 32,
  },
  quoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  thoughtBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thoughtBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  thoughtCount: {
    fontSize: 12,
    color: '#94a3b8',
  },
  bottomActionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: 'rgba(246, 246, 248, 0.95)',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: '#306ee8',
    borderRadius: 12,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#306ee8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  recordButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
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
