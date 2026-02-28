import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { QUOTES, BOOKS } from '../../constants/dummy';

export default function LogScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleMorePress = () => {
    // Dummy action
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header - quote.tsx와 동일한 스타일 사용 */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Liked Sentences</Text>
        
        <TouchableOpacity style={styles.iconButton} onPress={handleMorePress}>
          <MaterialIcons name="more-horiz" size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listContainer}>
          {QUOTES.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <MaterialIcons name="history" size={64} color="#cbd5e1" />
              <Text style={styles.emptyStateTitle}>아직 활동 기록이 없습니다</Text>
              <Text style={styles.emptyStateDesc}>
                책을 읽고 문장을 남기면 이곳에 활동이 기록됩니다.
              </Text>
            </View>
          ) : (
            QUOTES.map((quote, index) => {
              // 더미 책 데이터 매핑
              const book = BOOKS[index % BOOKS.length];
              
              return (
                <TouchableOpacity 
                  key={quote.id} 
                  style={styles.card}
                  activeOpacity={0.9}
                  onPress={() => router.push({ pathname: '/book/quote', params: { bookId: book.id, quoteId: quote.id } })}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.bookTag}>
                      <Text style={styles.bookTagText}>{book.title}</Text>
                    </View>
                    <MaterialIcons name="favorite" size={20} color="#ec4899" />
                  </View>
                  
                  <Text style={styles.quoteText} numberOfLines={3}>
                    {quote.text}
                  </Text>
                  
                  <View style={styles.cardFooter}>
                    <Text style={styles.footerText}>{book.author}</Text>
                    <Text style={styles.footerText}>{quote.date}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
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
    paddingBottom: 100,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#ffffff',
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bookTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f1f5f9',
  },
  bookTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#334155',
    fontStyle: 'italic',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
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
    lineHeight: 20,
  },
});
